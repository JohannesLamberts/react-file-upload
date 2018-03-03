import * as React         from 'react';
import { ImmutableArray } from 'typescript-immutable';
import { XHRUpload }      from './xhrUpload';

export interface FileUpload {
    progressTotal: number;
    progressLoaded: number;
    error: boolean;
    upload: XHRUpload;
}

export interface FileUploaderProps {
    url: string;
    children: (push: ((list: File[]) => void), queue: FileUpload[]) => React.ReactNode;
    fieldName?: string;
    method?: 'POST' | 'PATCH' | 'PUT';
    headers?: Object;
    field?: string;
}

export default class extends React.PureComponent<FileUploaderProps, {
    queue: ImmutableArray<FileUpload>
}> {

    constructor(props: FileUploaderProps) {
        super(props);
        this.handlePush = this.handlePush.bind(this);
        this.state = {
            queue: new ImmutableArray()
        };
    }

    handlePush(files: File[]) {
        if (files) {
            const newUploads: FileUpload[] = new Array(files.length);
            for (let i = 0; i < files.length; i++) {
                const obj = {};
                const updatePartial = (update: Partial<FileUpload>) => {
                    this.setState(
                        {
                            queue: this.state.queue.update(
                                this.state.queue.indexOf(obj as FileUpload),
                                currVal => Object.assign({},
                                                         currVal,
                                                         updatePartial))
                        });
                };
                const xhrUpload = new XHRUpload(
                    { [this.props.fieldName || 'file']: files[i] },
                    this.props.method || 'POST',
                    this.props.url,
                    this.props.headers || {},
                    {
                        abort: () => this.setState(
                            {
                                queue: this.state.queue.remove(
                                    this.state.queue.indexOf(obj as FileUpload))
                            }),
                        progress: (progressTotal, progressLoaded) =>
                            updatePartial({
                                              progressTotal,
                                              progressLoaded
                                          }),
                        retry: () =>
                            updatePartial({
                                              progressTotal: 0,
                                              progressLoaded: 0,
                                              error: false
                                          })
                    }
                );
                const newUpload: FileUpload = {
                    progressLoaded: 0,
                    progressTotal: 0,
                    upload: xhrUpload,
                    error: false
                };
                Object.assign(obj, newUpload);
                newUploads[i] = obj as FileUpload;
                xhrUpload
                    .run()
                    .catch(e => {
                        if (e.name === 'EFileUploadError') {
                            updatePartial({
                                              error: true
                                          });
                        }
                    });
            }
            this.setState(
                {
                    queue: this.state.queue.push(...newUploads)
                });
        }
    }

    render() {
        return this.props.children(this.handlePush, this.state.queue.slice());
    }
}