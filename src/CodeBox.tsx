import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { useCallback } from "react";
import './CodeBox.css';

const CodeBox = (props: {sendQuery: /*React.Dispatch<React.SetStateAction<string>>*/ (query: string) => void}) => {
    const onChange = useCallback(async (value: string) => {
        props.sendQuery(value);
    }, [props]);
    
    return (
        <div className="code-box">
        <CodeMirror
            extensions={[sql()]}
            onChange={onChange}
        />
        </div>
    );
};

export default CodeBox;
