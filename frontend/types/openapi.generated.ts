import type { DecimalString } from "./decimal";

export interface paths {
    "/api/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Health */
        get: operations["get_health_api_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/market/prices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Prices */
        get: operations["list_prices_api_market_prices_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/market/prices/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refresh
         * @description Sem rede não é erro: o ticker vai para `failed` e o cache fica como estava.
         */
        post: operations["refresh_api_market_prices_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/operations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List All */
        get: operations["list_all_api_operations_get"];
        put?: never;
        /** Create */
        post: operations["create_api_operations_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/operations/transfer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Transfer */
        post: operations["transfer_api_operations_transfer_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/operations/{operation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update */
        put: operations["update_api_operations__operation_id__put"];
        post?: never;
        /** Delete */
        delete: operations["delete_api_operations__operation_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/operations/import/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Preview
         * @description Lê os arquivos e classifica cada linha contra o banco, sem gravar nada.
         */
        post: operations["preview_api_operations_import_preview_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/operations/import/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirm */
        post: operations["confirm_api_operations_import_confirm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List All */
        get: operations["list_all_api_assets_get"];
        put?: never;
        /** Create */
        post: operations["create_api_assets_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{asset_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get */
        get: operations["get_api_assets__asset_id__get"];
        /** Update */
        put: operations["update_api_assets__asset_id__put"];
        post?: never;
        /** Delete */
        delete: operations["delete_api_assets__asset_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portfolio/positions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Positions */
        get: operations["positions_api_portfolio_positions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * AssetClass
         * @enum {string}
         */
        AssetClass: "stock" | "fii" | "etf" | "bdr" | "fixed_income";
        /** AssetDTO */
        AssetDTO: {
            /** Id */
            id: number;
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
            /** Cnpj */
            cnpj: string | null;
            /** Sector */
            sector: string | null;
        };
        /** AssetInDTO */
        AssetInDTO: {
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
            /** Cnpj */
            cnpj?: string | null;
            /** Sector */
            sector?: string | null;
        };
        /** AssetPriceDTO */
        AssetPriceDTO: {
            /** Asset Id */
            asset_id: number;
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
            /** Close */
            close: DecimalString | null;
            /** Price Date */
            price_date: string | null;
        };
        /** Body_preview_api_operations_import_preview_post */
        Body_preview_api_operations_import_preview_post: {
            /** Files */
            files: Blob[];
        };
        /**
         * ErrorResponse
         * @description O envelope único de erro: todo 4xx/5xx sai assim, com `detail` sempre string.
         */
        ErrorResponse: {
            /** Detail */
            detail: string;
        };
        /** HealthDTO */
        HealthDTO: {
            /** Status */
            status: string;
            /** Version */
            version: string;
            /**
             * Checked At
             * Format: date-time
             */
            checked_at: string;
        };
        /** IgnoredMovementDTO */
        IgnoredMovementDTO: {
            /** File */
            file: string;
            /** Ticker */
            ticker: string;
            /** Movement Date */
            movement_date: string;
            /** Movement */
            movement: string;
            /** Reason */
            reason: string;
        };
        /** ImportConfirmDTO */
        ImportConfirmDTO: {
            /** Operations */
            operations: components["schemas"]["ImportedOperationDTO"][];
            /** New Assets */
            new_assets: components["schemas"]["NewAssetDTO"][];
        };
        /** ImportFileDTO */
        ImportFileDTO: {
            /** Name */
            name: string;
            source: components["schemas"]["ImportSource"] | null;
            /** Error */
            error: string | null;
        };
        /** ImportPreviewDTO */
        ImportPreviewDTO: {
            /** Files */
            files: components["schemas"]["ImportFileDTO"][];
            /** Rows */
            rows: components["schemas"]["PreviewRowDTO"][];
            /** Ignored */
            ignored: components["schemas"]["IgnoredMovementDTO"][];
            /** New Assets */
            new_assets: components["schemas"]["NewAssetDTO"][];
        };
        /** ImportResultDTO */
        ImportResultDTO: {
            /** Created */
            created: number;
            /** Skipped */
            skipped: number;
            /** Assets Created */
            assets_created: string[];
        };
        /**
         * ImportSource
         * @enum {string}
         */
        ImportSource: "b3" | "nubank";
        /**
         * ImportStatus
         * @enum {string}
         */
        ImportStatus: "new" | "existing" | "possible_duplicate" | "repeated_in_batch";
        /**
         * ImportedOperationDTO
         * @description Uma operação lida de arquivo: sai do parser, vai ao preview e volta no
         *     confirmar. Transferência não vem de arquivo.
         */
        ImportedOperationDTO: {
            /** Ticker */
            ticker: string;
            /**
             * Operation Date
             * Format: date
             */
            operation_date: string;
            operation_type: components["schemas"]["OperationType"];
            /**
             * Quantity
             * Format: decimal
             */
            quantity: DecimalString;
            /**
             * Unit Price
             * Format: decimal
             */
            unit_price: DecimalString;
        };
        /** NewAssetDTO */
        NewAssetDTO: {
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
        };
        /** OperationDTO */
        OperationDTO: {
            /** Id */
            id: number;
            /** Asset Id */
            asset_id: number;
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
            /**
             * Operation Date
             * Format: date
             */
            operation_date: string;
            operation_type: components["schemas"]["OperationType"];
            /**
             * Quantity
             * Format: decimal
             */
            quantity: DecimalString;
            /**
             * Unit Price
             * Format: decimal
             */
            unit_price: DecimalString;
        };
        /**
         * OperationInDTO
         * @description Compra, venda e evento corporativo; a transferência tem endpoint próprio,
         *     porque o preço dela é o PM da origem.
         */
        OperationInDTO: {
            /** Asset Id */
            asset_id: number;
            /**
             * Operation Date
             * Format: date
             */
            operation_date: string;
            operation_type: components["schemas"]["OperationType"];
            /**
             * Quantity
             * Format: decimal
             */
            quantity: DecimalString;
            /**
             * Unit Price
             * Format: decimal
             */
            unit_price: DecimalString;
        };
        /**
         * OperationType
         * @enum {string}
         */
        OperationType: "buy" | "sell" | "bonus" | "split" | "reverse_split" | "transfer_in" | "transfer_out";
        /** PositionDTO */
        PositionDTO: {
            /** Asset Id */
            asset_id: number;
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
            /**
             * Quantity
             * Format: decimal
             */
            quantity: DecimalString;
            /**
             * Average Price
             * Format: decimal
             */
            average_price: DecimalString;
            /**
             * Total Cost
             * Format: decimal
             */
            total_cost: DecimalString;
        };
        /** PreviewRowDTO */
        PreviewRowDTO: {
            /** Ticker */
            ticker: string;
            /**
             * Operation Date
             * Format: date
             */
            operation_date: string;
            operation_type: components["schemas"]["OperationType"];
            /**
             * Quantity
             * Format: decimal
             */
            quantity: DecimalString;
            /**
             * Unit Price
             * Format: decimal
             */
            unit_price: DecimalString;
            /** File */
            file: string;
            status: components["schemas"]["ImportStatus"];
        };
        /** RefreshReportDTO */
        RefreshReportDTO: {
            /** Updated */
            updated: string[];
            /** Failed */
            failed: string[];
        };
        /** TransferInDTO */
        TransferInDTO: {
            /** From Asset Id */
            from_asset_id: number;
            /** To Asset Id */
            to_asset_id: number;
            /**
             * Operation Date
             * Format: date
             */
            operation_date: string;
            /**
             * Quantity
             * Format: decimal
             */
            quantity: DecimalString;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    get_health_api_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthDTO"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_prices_api_market_prices_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetPriceDTO"][];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    refresh_api_market_prices_refresh_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RefreshReportDTO"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_all_api_operations_get: {
        parameters: {
            query?: {
                asset_id?: number | null;
                operation_type?: components["schemas"]["OperationType"] | null;
                start?: string | null;
                end?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationDTO"][];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    create_api_operations_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OperationInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationDTO"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    transfer_api_operations_transfer_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TransferInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationDTO"][];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    update_api_operations__operation_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                operation_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OperationInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationDTO"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    delete_api_operations__operation_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                operation_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    preview_api_operations_import_preview_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_preview_api_operations_import_preview_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportPreviewDTO"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    confirm_api_operations_import_confirm_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ImportConfirmDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportResultDTO"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_all_api_assets_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetDTO"][];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    create_api_assets_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssetInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetDTO"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_api_assets__asset_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                asset_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetDTO"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    update_api_assets__asset_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                asset_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssetInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetDTO"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    delete_api_assets__asset_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                asset_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    positions_api_portfolio_positions_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PositionDTO"][];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
}
