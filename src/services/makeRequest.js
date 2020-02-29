import axios from 'axios';

export default function makeRequest (config) {
    return new Promise((resolve, reject) => {
        try {
            axios({
                method: config.method || 'GET',
                url: config.url,
                data: config.data,
                headers: config.headers ? config.headers : {},
                params: config.params,
            }).then((result) => {
                resolve(result)
            }).catch(error => {
                throw new Error('Error requesting: ', error);
            });
        } catch (err) {
            reject(err);
        }
    });
}
