import * as React         from 'react';
import { ImmutableArray } from 'typescript-immutable';
import { XHRUpload }      from './xhrUpload';

export interface FileUpload {
    progressTotal: number;
    progressLoaded: number;
    error: boolean;
    ready: boolean;
    upload: XHRUpload;
    name: string;
}

export interface FileUploaderChildrenProps {
    handleFiles: ((list: File[]) => void);
    queue: FileUpload[];
    runManual: () => void
}

export interface FileUploaderProps {
    url: string;
    children: (props: FileUploaderChildrenProps) => React.ReactNode;
    runManual?: boolean;
    keepOnFinish?: boolean;
    fieldName?: string;
    method?: 'POST' | 'PATCH' | 'PUT';
    headers?: Object;
}

export default class extends React.PureComponent<FileUploaderProps, {
    queue: ImmutableArray<FileUpload>
}> {

    constructor(props: FileUploaderProps) {
        super(props);
        this.handleFiles = this.handleFiles.bind(this);
        this.handleManualRun = this.handleManualRun.bind(this);
        this.state = {
            queue: new ImmutableArray()
        };
    }

    handleManualRun() {
        for (const el of this.state.queue.slice()) {
            if (!el.upload.running) {
                el.upload.run();
            }
        }
    }

    handleFiles(files: File[]) {
        if (files.length === 0) {
            return;
        }
        const newUploads: FileUpload[] = new Array(files.length);
        for (let i = 0; i < files.length; i++) {
            const obj = {};
            const updatePartial = (update: Partial<FileUpload>) => {
                this.setState(
                    {
                        queue: this.state.queue.update(
                            this.state.queue.indexOf(obj as FileUpload),
                            currVal => Object.assign(currVal,
                                                     update))
                    });
            };
            const removeFromList = () => this.setState(
                {
                    queue: this.state.queue.remove(
                        this.state.queue.indexOf(obj as FileUpload))
                });
            const xhrUpload = new XHRUpload(
                { [this.props.fieldName || 'file']: files[i] },
                this.props.method || 'POST',
                this.props.url,
                this.props.headers || {},
                {
                    abort: removeFromList,
                    progress: (progressTotal, progressLoaded) =>
                        updatePartial({
                                          progressTotal,
                                          progressLoaded
                                      }),
                    retry: () =>
                        updatePartial({
                                          progressTotal: 0,
                                          progressLoaded: 0,
                                          error: false,
                                          ready: false
                                      }),
                    error: e =>
                        updatePartial({
                                          error: true
                                      }),
                    finish: () => {
                        if (!this.props.keepOnFinish) {
                            removeFromList();
                        } else {
                            updatePartial({
                                              ready: true
                                          });
                        }
                    }
                }
            );
            const newUpload: FileUpload = {
                progressLoaded: 0,
                progressTotal: 0,
                upload: xhrUpload,
                error: false,
                ready: false,
                name: files[i].name
            };
            Object.assign(obj, newUpload);
            newUploads[i] = obj as FileUpload;
            if (!this.props.runManual) {
                xhrUpload.run();
            }
        }
        this.setState(
            {
                queue: this.state.queue.push(...newUploads)
            });

    }

    render() {
        return this.props.children(
            {
                handleFiles: this.handleFiles,
                queue: this.state.queue.slice(),
                runManual: this.handleManualRun
            });
    }
}