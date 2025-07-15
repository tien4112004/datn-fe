import axios from 'axios';
import message from '@/utils/message';
// import { useI18n } from 'vue-i18n';

// const { t } = useI18n();
const instance = axios.create({ timeout: 1000 * 300 });

instance.interceptors.response.use(
  (response) => {
    if (response.status >= 200 && response.status < 400) {
      return Promise.resolve(response.data);
    }

    message.error('Unknown request error!');
    // message.error(t('system.services.unknownRequestError'));
    return Promise.reject(response);
  },
  (error) => {
    if (error && error.response) {
      if (error.response.status >= 400 && error.response.status < 500) {
        return Promise.reject(error.message);
      } else if (error.response.status >= 500) {
        return Promise.reject(error.message);
      }

      message.error('The server encountered an unknown error!');
      //   message.error(t('system.services.serverUnknownError'));
      return Promise.reject(error.message);
    }

    message.error('Failed to connect to the server or the server response timed out!');
    // message.error(t('system.services.failedToConnect'));
    return Promise.reject(error);
  }
);

export default instance;
