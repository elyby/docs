import type { Image, Paragraph, Parent, Root } from 'mdast';

// Turns a paragraph that contains only an image with a title into a figure with a caption:
//
//   ![Alt text](/img/picture.png "Caption")
//
// becomes
//
//   <figure><img src="/img/picture.png" alt="Alt text"><figcaption>Caption</figcaption></figure>
//
// It allows to keep captions as a plain Markdown, so they are translated along with the image in Crowdin
export default function remarkFigure() {
    return (tree: Root): void => {
        visit(tree);
    };
}

function visit(node: Parent): void {
    for (const child of node.children) {
        if (child.type === 'paragraph') {
            transformParagraph(child);
        } else if ('children' in child) {
            visit(child);
        }
    }
}

function transformParagraph(paragraph: Paragraph): void {
    const children = paragraph.children.filter((child) => !(child.type === 'text' && child.value.trim() === ''));
    if (children.length !== 1 || children[0].type !== 'image' || !children[0].title) {
        return;
    }

    const image: Image = children[0];
    const caption = image.title;
    image.title = null;

    paragraph.data = {...paragraph.data, hName: 'figure'};
    paragraph.children = [
        image,
        {
            // Any phrasing node will do, it's rendered as <figcaption> anyway
            type: 'emphasis',
            data: {hName: 'figcaption'},
            children: [{type: 'text', value: caption}],
        },
    ];
}
