import { ApiProperty } from '@nestjs/swagger';

export class TagLinkDto {
  position: number;
  title: string;
  link: string;
}

export class IazoTagDto {
  tagName: string;
  tagIcon: string;
  @ApiProperty({ type: () => [TagLinkDto] })
  tagLinks: [TagLinkDto];
}
