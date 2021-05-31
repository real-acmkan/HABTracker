interface Credit {
    model: {
        name: string;
        link: string;
    };
    license: {
        name: string;
        link: string;
    };
    author: string;
}
export default function (attribution: Credit[], container: HTMLElement): void;
export {};
