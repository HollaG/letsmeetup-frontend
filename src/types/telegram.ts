// types.ts
export interface ITelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username: string;
    language_code?: string;
    photo_url?: string;
}

export interface IWebApp {
    initData: string;
    initDataUnsafe: {
        query_id: string;
        user: ITelegramUser;
        auth_date: string;
        hash: string;
    };
    version: string;
    platform: string;
    colorScheme: string;
    themeParams: {
        link_color: string;
        button_color: string;
        button_text_color: string;
        secondary_bg_color: string;
        hint_color: string;
        bg_color: string;
        text_color: string;
    };
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    isClosingConfirmationEnabled: boolean;
    headerColor: string;
    backgroundColor: string;
    sendData: (data: any) => void;
    BackButton: {
        isVisible: boolean;
    };
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isProgressVisible: boolean;
        isActive: boolean;
        setText: (text: string) => void;
        onClick: (e: any) => void;
        offClick: (e: any) => void;
        showProgress: (leaveActive: boolean) => void;
        hideProgress: () => void;
        disable: () => void;
        enable: () => void;
    };
    HapticFeedback: any;
    close: () => void;
    switchInlineQuery: (query: string, choose_chat_types: string[]) => void;
}

export {};