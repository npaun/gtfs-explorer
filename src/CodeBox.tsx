import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { useCallback } from "react";

const CodeBox = (props: {sendQuery: React.Dispatch<React.SetStateAction<string>>}) => {
    const onChange = useCallback(async (value: string) => {
        props.sendQuery(value);
    }, [props]);
    
    return (
        <div className="code-box">
        <CodeMirror
            value="select * from stops;"
            height="600px"
            extensions={[sql()]}
            onChange={onChange}
        />
        </div>
    );
};

export default CodeBox;
