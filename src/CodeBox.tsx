import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { useCallback } from "react";
import './CodeBox.css';

const CodeBox = (props: {sendQuery: /*React.Dispatch<React.SetStateAction<string>>*/ (query: string) => void; query: string|null}) => {
    const onChange = useCallback(async (value: string) => {
        props.sendQuery(value);
    }, [props]);
    
    return (
        <div className="code-box">
        <CodeMirror
            value={props.query ?? ''}
            extensions={[sql()]}
            onChange={onChange}
        />
        </div>
    );
};

export default CodeBox;
