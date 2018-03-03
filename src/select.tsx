import * as React from 'react';

export interface FileSelectProps {
    onChange: (files: File[]) => void;
    children: React.ReactNode;
    multiple?: boolean;
    className?: string;
    style?: React.CSSProperties;
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
        const { className, style, children, multiple } = this.props;
        return (
            <label
                className={className}
                style={style}
            >
                {children}
                <input
                    style={{
                        opactiy: 0,
                        position: 'absolute',
                        display: 'none'
                    }}
                    type={'file'}
                    multiple={!!multiple}
                    onChange={this.handleChange}
                />
            </label>
        );
    }
}