export class XHRUpload {

    private _xhr: XMLHttpRequest | null;
    private _formData = new FormData();

    private _running = false;

    get running() {
        return this._running;
    }

    private _ready = false;

    get ready() {
        return this._ready;
    }

    get files(): File[] {
        return Object.keys(this._files).map(key => this._files[key]);
    }

    constructor(private _files: Record<string, File>,
                private _method: 'POST' | 'PUT' | 'PATCH',
                private _path: string,
                private _headers: Object,
                private _on: {
                    abort: () => void;
                    progress: (total: number, loaded: number) => void;
                    retry: () => void;
                    finish: () => void;
                    error: (e: Error) => void;
                }) {
        for (const key of Object.keys(this._files)) {
            this._formData.append(key, this._files[key]);
        }
    }

    run(): void {
        if (this._running) {
            throw new Error(`Upload is already in progress`);
        }
        this._running = true;
        this._ready = false;

        this._xhr = new XMLHttpRequest();
        this._xhr.upload.onprogress = (ev: ProgressEvent) => {
            this._on.progress(ev.total, ev.loaded);
            return {};
        };

        this._xhr.onerror = this._xhr.upload.onerror = () => {
            this._running = false;
            this._on.error(new Error(`EFileUploadError`));
        };

        this._xhr.onabort = this._xhr.upload.onabort = () => {
            this._running = false;
            this._on.abort();
        };

        this._xhr.onload = () => {
            this._ready = true;
            this._running = false;
            this._on.finish();
        };

        this._xhr.open(this._method, this._path, true);
        for (const key of Object.keys(this._headers)) {
            this._xhr.setRequestHeader(key, this._headers[key]);
        }
        this._xhr.send(this._formData);
    }

    retry() {
        if (this._running) {
            throw new Error(`Upload is already in progress`);
        }
        this._on.retry();
        this.run();
    }

    abort() {
        if (this._xhr) {
            this._xhr.abort();
        }
        this._on.abort();
    }
}