class TagLinkDto {
    position: number;
    title: string;
    link: string;
}

export class IazoTagDto {
    tagName: string;
    tagIcon: string;
    tagLinks: [TagLinkDto];
}
