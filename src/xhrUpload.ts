export class XHRUpload {

    private _xhr: XMLHttpRequest | null;
    private _formData = new FormData();
    private _running = false;

    constructor(files: Record<string, File>,
                private _method: 'POST' | 'PUT' | 'PATCH',
                private _path: string,
                private _headers: Object,
                private _handlers: {
                    abort: () => void;
                    progress: (total: number, loaded: number) => void;
                    retry: () => void;
                }) {
        for (const key of Object.keys(files)) {
            this._formData.append(key, files[key]);
        }
    }

    run(): Promise<{}> {
        if (this._running) {
            throw new Error(`Upload is already in progress`);
        }
        this._running = true;
        return new Promise(
            (resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (ev: ProgressEvent) => {
                    this._handlers.progress(ev.total, ev.loaded);
                    return {};
                };
                xhr.onerror = xhr.upload.onerror = () => reject(new Error(`EFileUploadError`));
                xhr.onabort = xhr.upload.onabort = () => reject(new Error(`EFileUploadAbort`));
                xhr.onload = () => resolve();

                xhr.open(this._method, this._path, true);
                for (const key of Object.keys(this._headers)) {
                    xhr.setRequestHeader(key, this._headers[key]);
                }
                xhr.send(this._formData);

                this._xhr = xhr;
            })
            .then(res => {
                this._running = false;
                return res;
            })
            .catch(e => {
                this._running = false;
                throw e;
            });
    }

    retry() {
        if (this._running) {
            throw new Error(`Upload is already in progress`);
        }
        this._handlers.retry();
        this.run();
    }

    abort() {
        if (this._xhr) {
            this._xhr.abort();
        }
        this._handlers.abort();
    }
}