// types.ts
export interface ITelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username: string;
    language_code?: string;
    photo_url?: string;
    type: string;
}

export interface ThemeParams {
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
    hint_color: string;
    bg_color: string;
    text_color: string;
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
    themeParams: ThemeParams;
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
    HapticFeedback: {
        impactOccured: (
            style: "light" | "medium" | "heavy" | "rigid" | "soft"
        ) => void;
        notificationOccured: (type: "error" | "success" | "warning") => void;
        selectionChanged: () => void;
    };
    close: () => void;
    switchInlineQuery: (query: string, choose_chat_types: string[]) => void;
    showPopup: (params: PopupParams, callback?: (id: string) => void) => void;
}

type PopupParams = {
    title?: string;
    message: string;
    buttons?: PopupButton[];
};

type PopupButton = {
    id?: string;
    type?: "default" | "ok" | "close" | "cancel" | "destructive";
    text?: string;
};

export {};
