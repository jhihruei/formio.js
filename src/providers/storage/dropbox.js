import NativePromise from 'native-promise-only';

const dropbox = (formio) => ({
  uploadFile(file, fileName, dir, progressCallback) {
    return new NativePromise(((resolve, reject) => {
      // Send the file with data.
      const xhr = new XMLHttpRequest();

      if (typeof progressCallback === 'function') {
        xhr.upload.onprogress = progressCallback;
      }

      const fd = new FormData();
      fd.append('name', fileName);
      fd.append('dir', dir);
      fd.append('file', file);

      // Fire on network error.
      xhr.onerror = (err) => {
        err.networkError = true;
        reject(err);
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.response);
          response.storage = 'dropbox';
          response.size = file.size;
          response.type = file.type;
          response.url = response.path_lower;
          resolve(response);
        }
        else {
          reject(xhr.response || 'Unable to upload file');
        }
      };

      xhr.onabort = reject;

      xhr.open('POST', `${formio.formUrl}/storage/dropbox`);
      const token = formio.getToken();
      if (token) {
        xhr.setRequestHeader('x-jwt-token', token);
      }
      xhr.send(fd);
    }));
  },
  downloadFile(file) {
    const token = formio.getToken();
    file.url =
      `${formio.formUrl}/storage/dropbox?path_lower=${file.path_lower}${token ? `&x-jwt-token=${token}` : ''}`;
    return NativePromise.resolve(file);
  }
});

dropbox.title = 'Dropbox';
export default dropbox;
