<h1 align="center">react-file-uploads</h1>

<div align="center">
[![CircleCI](https://img.shields.io/circleci/project/github/JohannesLamberts/react-file-uploads/master.svg)](https://circleci.com/gh/JohannesLamberts/react-file-uploads)
</div>

# Features
This packages provides some easy-to-use react components for file uploads.
It contains
- `FileUploader` to manage all uploads 
- `FileDropzone` as a simple dropzone wrapper-component
- `FileSelect` as a simple wrapper around `<input type="file" />` 

# Example

## Full-auto
```typescript jsx
import {
    Button,
    Icon,
    LinearProgress
}                                 from 'material-ui';
import * as React                 from 'react';
import {
    FileDropzone,
    FileSelect,
    FileUploader
}                                 from 'react-file-uploads';

export default () => (
    <FileUploader
        keepOnFinish={true}
        url={'http://localhost:4005/files'}
    >
        {({ handleFiles, queue }) => (
            <div>
                <FileDropzone onDrop={handleFiles}>
                    {queue.map((el, index) => (
                        <div key={index}>
                            {index} {el.name}
                            <LinearProgress
                                variant={el.progressTotal
                                    ? 'determinate'
                                    : 'indeterminate'}
                                value={el.progressLoaded / el.progressTotal * 100}
                            />
                        </div>
                    ))}
                    DROP FILES HERE
                </FileDropzone>
                <div>
                    Uploaded: {queue.length} <br/>
                    Waiting: {queue.filter(el => !el.ready).length}<br/>
                    Ready: {queue.filter(el => el.ready).length}
                </div>
                <FileSelect
                    onChange={handleFiles}
                    multiple={true}
                >
                    <Icon>file_upload</Icon>Upload
                </FileSelect>
            </div>
        )}
    </FileUploader>
);
```

## Manual run()

```typescript jsx
import {
    Button,
    Icon,
    LinearProgress
}                                 from 'material-ui';
import * as React                 from 'react';
import {
    FileDropzone,
    FileSelect,
    FileUploader
}                                 from 'react-file-uploads';

export default () => (
    <FileUploader
        runManual={true}
        keepOnFinish={true}
        url={'http://localhost:4005/files'}
    >
        {({ handleFiles, queue, runManual }) => (
            <div>
                <!--- as above -->
                <Button onClick={runManual}>
                    <Icon>check</Icon> Run
                </Button>
            </div>
        )}
    </FileUploader>
);
```

# Components
## FileUploader
|Name|Type|Default|Description|
|---|---|---|---|
| url * | `string` | (required) |  HTTP-URL
| children * | `(props: FileUploaderChildrenProps) => React.ReactNode` | (required) | child-component 
| runManual | `boolean` | `false` | Don't run upload on handleFiles() - use runManual instead
| keepOnFinish | `boolean` | `false` | Keep uploaded files in queue
| fieldName | `string` | `'file'` | Form-Field
| method | `'POST' / 'PATCH' / 'PUT'` | `'POST'`| HTTP-Method
| headers | `Object` | `{}` | HTTP-Headers

```typescript
interface FileUploaderChildrenProps {
    handleFiles: ((list: File[]) => void);
    queue: FileUpload[];
    runManual: () => void
}
```
```typescript
interface FileUpload {
    progressTotal: number;
    progressLoaded: number;
    error: boolean;
    ready: boolean;
    upload: XHRUpload;  // don't access directly
    name: string;
}
```

## FileDropzone
|Name|Type|Default|Description|
|---|---|---|---|
| onDrop * | `(files: File[]) => void` | (required) | handler function
| children * | `React.ReactNode`; | (required)
| className | `string` | undefined | 
| classNameActive | `string` | undefined | class-name on dragActive
| style | `React.CSSProperties` | undefined |

## FileSelect
|Name|Type|Default|Description|
|---|---|---|---|
| onChange: `(files: File[]) => void` | (required) | handler function
| children | `React.ReactNode` | (required)
| multiple | `boolean` | false
| className | `string` | undefined | 
| style | `React.CSSProperties` | undefined |