'use client'

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import styles from "./tiptap.module.scss";
interface TiptapProps {
    content: string;
    onUpdate?: (content: string) => void;
}
export function Tiptap(props: TiptapProps) {

    const { content, onUpdate } = props;
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            if (onUpdate) {
                onUpdate(editor.getHTML());
            }
        },
    })

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return <EditorContent editor={editor} className={styles.editor} />
}
