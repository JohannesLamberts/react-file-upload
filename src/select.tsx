import * as React from 'react';

export interface FileSelectProps {
    multiple?: boolean;
    onChange: (files: File[]) => void;
    children: React.ReactNode;
}

export default class extends React.PureComponent<FileSelectProps> {

    constructor(props: FileSelectProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            this.props.onChange(Array.from(e.target.files));
        }
        e.target.value = null as any;
    }

    render() {
        return (
            <label>
                {this.props.children}
                <input
                    style={{
                        opactiy: 0,
                        position: 'absolute',
                        display: 'none'
                    }}
                    type={'file'}
                    multiple={!!this.props.multiple}
                    onChange={this.handleChange}
                />
            </label>
        );
    }
}