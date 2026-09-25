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
         * @description Com o cache em dia, responde sem sair da máquina. Sem rede não é erro: o cache
         *     fica como estava, e o ticker vai para `failed` quando a falta é problema novo.
         */
        post: operations["refresh_api_market_prices_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/market/indexes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Indexes */
        get: operations["list_indexes_api_market_indexes_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/market/indexes/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refresh Index Series
         * @description Com o cache em dia, responde sem sair da máquina. Sem rede não é erro: o cache
         *     fica como estava, e a série vai para `failed` quando a falta é problema novo.
         */
        post: operations["refresh_index_series_api_market_indexes_refresh_post"];
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
    "/api/portfolio": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Portfolio */
        get: operations["get_portfolio_api_portfolio_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/fixed-income": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List All */
        get: operations["list_all_api_fixed_income_get"];
        put?: never;
        /** Create */
        post: operations["create_api_fixed_income_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/fixed-income/{investment_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get */
        get: operations["get_api_fixed_income__investment_id__get"];
        /** Update */
        put: operations["update_api_fixed_income__investment_id__put"];
        post?: never;
        /** Delete */
        delete: operations["delete_api_fixed_income__investment_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/fixed-income/{investment_id}/movements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Movement */
        post: operations["create_movement_api_fixed_income__investment_id__movements_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/fixed-income/movements/{movement_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Remove Movement */
        delete: operations["remove_movement_api_fixed_income_movements__movement_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tax/months": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List All Months */
        get: operations["list_all_months_api_tax_months_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tax/period": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Period */
        get: operations["get_period_api_tax_period_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tax/darf/{year}/{month}/payment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Put Payment */
        put: operations["put_payment_api_tax_darf__year___month__payment_put"];
        post?: never;
        /** Remove Payment */
        delete: operations["remove_payment_api_tax_darf__year___month__payment_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tax/irpf/{year}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Irpf */
        get: operations["get_irpf_api_tax_irpf__year__get"];
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
        AssetClass: "stock" | "fii" | "etf" | "bdr";
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
        /** CategoryAllocationDTO */
        CategoryAllocationDTO: {
            category: components["schemas"]["PortfolioCategory"];
            /**
             * Value
             * Format: decimal
             */
            value: DecimalString;
            /**
             * Share
             * Format: decimal
             */
            share: DecimalString;
        };
        /**
         * CategoryResultDTO
         * @description `exempt` marca o ganho comum com ações que a isenção do mês tirou da base.
         */
        CategoryResultDTO: {
            asset_class: components["schemas"]["AssetClass"];
            trade_type: components["schemas"]["TradeType"];
            pool: components["schemas"]["LossPool"];
            /**
             * Result
             * Format: decimal
             */
            result: DecimalString;
            /**
             * Sales
             * Format: decimal
             */
            sales: DecimalString;
            /** Exempt */
            exempt: boolean;
        };
        /** DarfPaymentDTO */
        DarfPaymentDTO: {
            /**
             * Paid On
             * Format: date
             */
            paid_on: string;
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
        };
        /** DarfPaymentInDTO */
        DarfPaymentInDTO: {
            /**
             * Paid On
             * Format: date
             */
            paid_on: string;
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
        };
        /**
         * DarfStatus
         * @description A situação do mês apurado, do ponto de vista do DARF.
         * @enum {string}
         */
        DarfStatus: "paid" | "due" | "overdue" | "carried" | "exempt" | "compensated" | "none";
        /**
         * ErrorResponse
         * @description O envelope único de erro: todo 4xx/5xx sai assim, com `detail` sempre string.
         */
        ErrorResponse: {
            /** Detail */
            detail: string;
        };
        /**
         * FixedIncomeDTO
         * @description O título com a marcação em `as_of`: hoje, ou o vencimento se já passou.
         */
        FixedIncomeDTO: {
            /** Id */
            id: number;
            /** Label */
            label: string;
            indexer: components["schemas"]["Indexer"];
            /**
             * Rate
             * Format: decimal
             */
            rate: DecimalString;
            /** Maturity Date */
            maturity_date: string | null;
            /** Daily Liquidity */
            daily_liquidity: boolean;
            /** Tax Exempt */
            tax_exempt: boolean;
            /**
             * Invested
             * Format: decimal
             */
            invested: DecimalString;
            /**
             * Gross Value
             * Format: decimal
             */
            gross_value: DecimalString;
            /**
             * Estimated Tax
             * Format: decimal
             */
            estimated_tax: DecimalString;
            /**
             * Net Value
             * Format: decimal
             */
            net_value: DecimalString;
            /**
             * As Of
             * Format: date
             */
            as_of: string;
            /** Series Date */
            series_date: string | null;
        };
        /** FixedIncomeDetailDTO */
        FixedIncomeDetailDTO: {
            /** Id */
            id: number;
            /** Label */
            label: string;
            indexer: components["schemas"]["Indexer"];
            /**
             * Rate
             * Format: decimal
             */
            rate: DecimalString;
            /** Maturity Date */
            maturity_date: string | null;
            /** Daily Liquidity */
            daily_liquidity: boolean;
            /** Tax Exempt */
            tax_exempt: boolean;
            /**
             * Invested
             * Format: decimal
             */
            invested: DecimalString;
            /**
             * Gross Value
             * Format: decimal
             */
            gross_value: DecimalString;
            /**
             * Estimated Tax
             * Format: decimal
             */
            estimated_tax: DecimalString;
            /**
             * Net Value
             * Format: decimal
             */
            net_value: DecimalString;
            /**
             * As Of
             * Format: date
             */
            as_of: string;
            /** Series Date */
            series_date: string | null;
            /** Movements */
            movements: components["schemas"]["MovementDTO"][];
        };
        /** FixedIncomeHoldingDTO */
        FixedIncomeHoldingDTO: {
            /** Investment Id */
            investment_id: number;
            /** Label */
            label: string;
            indexer: components["schemas"]["Indexer"];
            /**
             * Rate
             * Format: decimal
             */
            rate: DecimalString;
            /**
             * Invested
             * Format: decimal
             */
            invested: DecimalString;
            /**
             * Gross Value
             * Format: decimal
             */
            gross_value: DecimalString;
            /**
             * Estimated Tax
             * Format: decimal
             */
            estimated_tax: DecimalString;
            /**
             * Net Value
             * Format: decimal
             */
            net_value: DecimalString;
            /**
             * Share
             * Format: decimal
             */
            share: DecimalString;
            /**
             * As Of
             * Format: date
             */
            as_of: string;
        };
        /** FixedIncomeInDTO */
        FixedIncomeInDTO: {
            /** Label */
            label: string;
            indexer: components["schemas"]["Indexer"];
            /**
             * Rate
             * Format: decimal
             */
            rate: DecimalString;
            /** Maturity Date */
            maturity_date?: string | null;
            /** Daily Liquidity */
            daily_liquidity: boolean;
            /** Tax Exempt */
            tax_exempt: boolean;
        };
        /**
         * FixedIncomeMovementType
         * @enum {string}
         */
        FixedIncomeMovementType: "application" | "redemption";
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
        /**
         * IndexSeries
         * @enum {string}
         */
        IndexSeries: "cdi" | "selic" | "ipca";
        /**
         * Indexer
         * @enum {string}
         */
        Indexer: "cdi" | "selic" | "ipca" | "prefixed";
        /**
         * IrpfAssetDTO
         * @description Um item da ficha Bens e Direitos, pelo custo de aquisição em 31/12.
         */
        IrpfAssetDTO: {
            /** Asset Id */
            asset_id: number;
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
            /** Group */
            group: string;
            /** Code */
            code: string;
            /** Cnpj */
            cnpj: string | null;
            /** Description */
            description: string;
            /**
             * Previous Value
             * Format: decimal
             */
            previous_value: DecimalString;
            /**
             * Current Value
             * Format: decimal
             */
            current_value: DecimalString;
        };
        /** IrpfExemptMonthDTO */
        IrpfExemptMonthDTO: {
            /** Month */
            month: number;
            /**
             * Profit
             * Format: decimal
             */
            profit: DecimalString;
        };
        /** IrpfLossDTO */
        IrpfLossDTO: {
            pool: components["schemas"]["LossPool"];
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
        };
        /** IrpfReportDTO */
        IrpfReportDTO: {
            /** Year */
            year: number;
            /** Darf Code */
            darf_code: string;
            /** Assets */
            assets: components["schemas"]["IrpfAssetDTO"][];
            /** Exempt Months */
            exempt_months: components["schemas"]["IrpfExemptMonthDTO"][];
            /**
             * Exempt Total
             * Format: decimal
             */
            exempt_total: DecimalString;
            /** Variable Income */
            variable_income: components["schemas"]["IrpfVariableIncomeMonthDTO"][];
            /** Losses */
            losses: components["schemas"]["IrpfLossDTO"][];
        };
        /**
         * IrpfVariableIncomeMonthDTO
         * @description Uma linha do demonstrativo de renda variável: o resultado líquido de cada
         *     conjunto no mês, o imposto apurado e o DARF pago de fato.
         */
        IrpfVariableIncomeMonthDTO: {
            /** Month */
            month: number;
            /**
             * Common
             * Format: decimal
             */
            common: DecimalString;
            /**
             * Day Trade
             * Format: decimal
             */
            day_trade: DecimalString;
            /**
             * Fii
             * Format: decimal
             */
            fii: DecimalString;
            /**
             * Tax
             * Format: decimal
             */
            tax: DecimalString;
            /** Darf Amount */
            darf_amount: DecimalString | null;
            /** Due Date */
            due_date: string | null;
            /** Paid On */
            paid_on: string | null;
            /** Paid Amount */
            paid_amount: DecimalString | null;
        };
        /** LatestIndexDTO */
        LatestIndexDTO: {
            series: components["schemas"]["IndexSeries"];
            /** Value */
            value: DecimalString | null;
            /** Rate Date */
            rate_date: string | null;
        };
        /**
         * LossPool
         * @description Conjunto de operações cujos prejuízos se compensam entre si: as comuns de
         *     ações, ETF e BDR; o day trade delas; e o FII, à parte.
         * @enum {string}
         */
        LossPool: "common" | "day_trade" | "fii";
        /**
         * MonthlyTaxDTO
         * @description A apuração do mês. `darf_amount` e `due_date` existem quando o imposto,
         *     somado ao que vinha carregado, chega ao mínimo do DARF.
         */
        MonthlyTaxDTO: {
            /** Year */
            year: number;
            /** Month */
            month: number;
            /** Categories */
            categories: components["schemas"]["CategoryResultDTO"][];
            /**
             * Stock Sales
             * Format: decimal
             */
            stock_sales: DecimalString;
            /**
             * Exempt Profit
             * Format: decimal
             */
            exempt_profit: DecimalString;
            /** Pools */
            pools: components["schemas"]["PoolResultDTO"][];
            /**
             * Gross Result
             * Format: decimal
             */
            gross_result: DecimalString;
            /**
             * Compensated
             * Format: decimal
             */
            compensated: DecimalString;
            /**
             * Taxable
             * Format: decimal
             */
            taxable: DecimalString;
            /**
             * Tax
             * Format: decimal
             */
            tax: DecimalString;
            /**
             * Carried Before
             * Format: decimal
             */
            carried_before: DecimalString;
            /**
             * Carried After
             * Format: decimal
             */
            carried_after: DecimalString;
            /** Darf Amount */
            darf_amount: DecimalString | null;
            /** Due Date */
            due_date: string | null;
            payment: components["schemas"]["DarfPaymentDTO"] | null;
            status: components["schemas"]["DarfStatus"];
        };
        /** MovementDTO */
        MovementDTO: {
            /** Id */
            id: number;
            /** Investment Id */
            investment_id: number;
            /**
             * Movement Date
             * Format: date
             */
            movement_date: string;
            movement_type: components["schemas"]["FixedIncomeMovementType"];
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
        };
        /**
         * MovementInDTO
         * @description Aplicação ou resgate, pelo valor bruto.
         */
        MovementInDTO: {
            /**
             * Movement Date
             * Format: date
             */
            movement_date: string;
            movement_type: components["schemas"]["FixedIncomeMovementType"];
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
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
        /**
         * PeriodPositionDTO
         * @description Posição num limite do período, pelo custo fiscal.
         */
        PeriodPositionDTO: {
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
        /**
         * PeriodReportDTO
         * @description Um mês ou um ano: as posições na abertura (fim do dia anterior a `start`) e
         *     no fechamento (fim de `end`), e a apuração de cada mês do recorte.
         */
        PeriodReportDTO: {
            /**
             * Start
             * Format: date
             */
            start: string;
            /**
             * End
             * Format: date
             */
            end: string;
            /** Opening */
            opening: components["schemas"]["PeriodPositionDTO"][];
            /** Closing */
            closing: components["schemas"]["PeriodPositionDTO"][];
            /** Months */
            months: components["schemas"]["MonthlyTaxDTO"][];
        };
        /**
         * PoolResultDTO
         * @description Um conjunto de compensação no mês: o líquido, o prejuízo que ele consumiu ou
         *     somou, e o imposto. `rate` vai de 0 a 1.
         */
        PoolResultDTO: {
            pool: components["schemas"]["LossPool"];
            /**
             * Net
             * Format: decimal
             */
            net: DecimalString;
            /**
             * Loss Before
             * Format: decimal
             */
            loss_before: DecimalString;
            /**
             * Compensated
             * Format: decimal
             */
            compensated: DecimalString;
            /**
             * Taxable
             * Format: decimal
             */
            taxable: DecimalString;
            /**
             * Rate
             * Format: decimal
             */
            rate: DecimalString;
            /**
             * Tax
             * Format: decimal
             */
            tax: DecimalString;
            /**
             * Loss After
             * Format: decimal
             */
            loss_after: DecimalString;
        };
        /**
         * PortfolioCategory
         * @description Categoria da carteira: as classes de ativo da B3, com o mesmo valor do
         *     `AssetClass`, mais a renda fixa.
         * @enum {string}
         */
        PortfolioCategory: "stock" | "fii" | "etf" | "bdr" | "fixed_income";
        /**
         * PortfolioDTO
         * @description Frações (`share`, `unrealized_return`) vão de 0 a 1.
         */
        PortfolioDTO: {
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
            /** Categories */
            categories: components["schemas"]["CategoryAllocationDTO"][];
            /** Positions */
            positions: components["schemas"]["PositionDTO"][];
            /** Fixed Income */
            fixed_income: components["schemas"]["FixedIncomeHoldingDTO"][];
        };
        /**
         * PositionDTO
         * @description `price` nulo é ativo sem cotação em cache, valorado pelo custo.
         */
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
            /** Price */
            price: DecimalString | null;
            /** Price Date */
            price_date: string | null;
            /**
             * Market Value
             * Format: decimal
             */
            market_value: DecimalString;
            /**
             * Share
             * Format: decimal
             */
            share: DecimalString;
            /**
             * Unrealized Result
             * Format: decimal
             */
            unrealized_result: DecimalString;
            /** Unrealized Return */
            unrealized_return: DecimalString | null;
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
        /**
         * TradeType
         * @description Operação comum (a posição atravessa o dia) ou day trade.
         * @enum {string}
         */
        TradeType: "swing" | "day_trade";
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
    list_indexes_api_market_indexes_get: {
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
                    "application/json": components["schemas"]["LatestIndexDTO"][];
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
    refresh_index_series_api_market_indexes_refresh_post: {
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
    get_portfolio_api_portfolio_get: {
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
                    "application/json": components["schemas"]["PortfolioDTO"];
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
    list_all_api_fixed_income_get: {
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
                    "application/json": components["schemas"]["FixedIncomeDTO"][];
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
    create_api_fixed_income_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FixedIncomeInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FixedIncomeDetailDTO"];
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
    get_api_fixed_income__investment_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                investment_id: number;
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
                    "application/json": components["schemas"]["FixedIncomeDetailDTO"];
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
    update_api_fixed_income__investment_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                investment_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FixedIncomeInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FixedIncomeDetailDTO"];
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
    delete_api_fixed_income__investment_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                investment_id: number;
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
    create_movement_api_fixed_income__investment_id__movements_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                investment_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MovementInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MovementDTO"];
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
    remove_movement_api_fixed_income_movements__movement_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                movement_id: number;
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
    list_all_months_api_tax_months_get: {
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
                    "application/json": components["schemas"]["MonthlyTaxDTO"][];
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
    get_period_api_tax_period_get: {
        parameters: {
            query: {
                year: number;
                month?: number | null;
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
                    "application/json": components["schemas"]["PeriodReportDTO"];
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
    put_payment_api_tax_darf__year___month__payment_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                year: number;
                month: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DarfPaymentInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MonthlyTaxDTO"];
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
    remove_payment_api_tax_darf__year___month__payment_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                year: number;
                month: number;
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
    get_irpf_api_tax_irpf__year__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                year: number;
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
                    "application/json": components["schemas"]["IrpfReportDTO"];
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
