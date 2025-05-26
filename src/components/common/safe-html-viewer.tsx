import DOMPurify from 'dompurify';

interface SafeHTMLViewerProps {
  html: string;
}

/**
 * Renders HTML content after sanitizing it to prevent XSS attacks
 * @param html - The HTML string to sanitize and render
 */
export const SafeHTMLViewer = ({ html }: SafeHTMLViewerProps) => {
  try {
    const cleanHTML = DOMPurify.sanitize(html);
    return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
  } catch (error) {
    console.error('Failed to sanitize HTML content:', error);
    return "";
  }
};
