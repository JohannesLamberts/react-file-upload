import * as React    from 'react';
import { DragEvent } from 'react';

export interface FileUploadDropzoneProps {
    onDrop: (files: File[]) => void;
    children: React.ReactNode;
    className?: string;
    classNameActive?: string;
}

export default class extends React.PureComponent<FileUploadDropzoneProps, {
    dragActive: boolean
}> {

    constructor(props: FileUploadDropzoneProps) {
        super(props);
        this.state = {
            dragActive: false
        };
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
    }

    handleDrop(ev: DragEvent<HTMLDivElement>) {
        ev.preventDefault();
        const dt = ev.dataTransfer;
        if (dt.items) {
            // Use DataTransferItemList interface to access the file(s)
            const newFiles = Array.from(dt.items)
                                  .filter(item => item.kind === 'file')
                                  .map(item => item.getAsFile()) as File[];
            this.props.onDrop(newFiles);
        } else {
            // Use DataTransfer interface to access the file(s)
            this.props.onDrop(Array.from(dt.files));
        }
        this.setState({ dragActive: false });
    }

    handleDragEnd(ev: DragEvent<{}>) {
        const dt = ev.dataTransfer;
        if (dt.items) {
            // Use DataTransferItemList interface to remove the drag data
            for (let i = 0; i < dt.items.length; i++) {
                dt.items.remove(i);
            }
        } else {
            // Use DataTransfer interface to remove the drag data
            ev.dataTransfer.clearData();
        }
        this.setState({ dragActive: false });
    }

    render() {
        return (
            <div
                className={`${this.props.className} ${this.state.dragActive
                    ? this.props.classNameActive
                    : ''}`}
                onDrop={this.handleDrop}
                onDragOver={ev => {
                    ev.preventDefault();
                    this.setState({ dragActive: true });
                }}
                onDragEnter={() => this.setState({ dragActive: true })}
                onDragLeave={() => this.setState({ dragActive: false })}
                onDragEnd={this.handleDragEnd}
            >
                {this.props.children}
            </div>
        );
    }
}