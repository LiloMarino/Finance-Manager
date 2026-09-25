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
    "/api/import/preview": {
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
        post: operations["preview_api_import_preview_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/import/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirm */
        post: operations["confirm_api_import_confirm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/income": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List All */
        get: operations["list_all_api_income_get"];
        put?: never;
        /** Create */
        post: operations["create_api_income_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/income/{income_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update */
        put: operations["update_api_income__income_id__put"];
        post?: never;
        /** Delete */
        delete: operations["delete_api_income__income_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/income/performance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Performance */
        get: operations["get_performance_api_income_performance_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/income/distribution": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Distribution */
        get: operations["get_distribution_api_income_distribution_get"];
        put?: never;
        post?: never;
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
    "/api/assets/{asset_id}/ticker-change": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ticker Change
         * @description Devolve o ativo que ficou: com junção, é o que já tinha o ticker novo.
         */
        post: operations["ticker_change_api_assets__asset_id__ticker_change_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/sectors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List All */
        get: operations["list_all_api_sectors_get"];
        put?: never;
        /** Create */
        post: operations["create_api_sectors_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/sectors/{sector_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Rename */
        put: operations["rename_api_sectors__sector_id__put"];
        post?: never;
        /** Delete */
        delete: operations["delete_api_sectors__sector_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/sectors/{sector_id}/segments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Add Segment */
        post: operations["add_segment_api_sectors__sector_id__segments_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/sectors/segments/{segment_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Rename One Segment */
        put: operations["rename_one_segment_api_sectors_segments__segment_id__put"];
        post?: never;
        /** Remove Segment */
        delete: operations["remove_segment_api_sectors_segments__segment_id__delete"];
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
    "/api/performance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Performance */
        get: operations["get_performance_api_performance_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/performance/monthly": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Monthly Performance */
        get: operations["get_monthly_performance_api_performance_monthly_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/evolution": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Evolution */
        get: operations["get_evolution_api_evolution_get"];
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
    "/api/data-health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Issues */
        get: operations["list_issues_api_data_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/simulation/rates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Current
         * @description O ponto de partida da projeção: o último valor real de cada série.
         */
        get: operations["current_api_simulation_rates_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/simulation/fixed-income": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Fixed Income
         * @description Conta sobre os valores enviados, sem gravar nada.
         */
        post: operations["fixed_income_api_simulation_fixed_income_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/simulation/installments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Installments
         * @description Conta sobre os valores enviados, sem gravar nada.
         */
        post: operations["installments_api_simulation_installments_post"];
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
         * ApplicationInDTO
         * @description Uma aplicação, pelo valor bruto.
         */
        ApplicationInDTO: {
            /**
             * Movement Date
             * Format: date
             */
            movement_date: string;
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
        };
        /**
         * AssetClass
         * @enum {string}
         */
        AssetClass: "stock" | "fii" | "etf" | "bdr";
        /**
         * AssetDTO
         * @description `segment_id` nulo é ativo sem classificação; `sector` e `segment` são os
         *     nomes vindos do segmento.
         */
        AssetDTO: {
            /** Id */
            id: number;
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
            /** Cnpj */
            cnpj: string | null;
            /** Segment Id */
            segment_id: number | null;
            /** Sector */
            sector: string | null;
            /** Segment */
            segment: string | null;
            /** Previous Tickers */
            previous_tickers: components["schemas"]["PreviousTickerDTO"][];
        };
        /** AssetInDTO */
        AssetInDTO: {
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
            /** Cnpj */
            cnpj?: string | null;
            /** Segment Id */
            segment_id?: number | null;
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
        /** BalancePointDTO */
        BalancePointDTO: {
            /**
             * Day
             * Format: date
             */
            day: string;
            /**
             * Installments
             * Format: decimal
             */
            installments: DecimalString;
            /** Cash */
            cash: DecimalString | null;
        };
        /**
         * BenchmarkReturnDTO
         * @description A referência no mesmo período e nos mesmos dias da carteira, recomeçando do
         *     zero na base dele. Depois de `data_until`, o último valor da série se repete.
         */
        BenchmarkReturnDTO: {
            series: components["schemas"]["IndexSeries"];
            /** Period */
            period: DecimalString | null;
            /** Data Until */
            data_until: string | null;
            /** Points */
            points: components["schemas"]["ReturnPointDTO"][];
        };
        /** BenchmarkYearsDTO */
        BenchmarkYearsDTO: {
            series: components["schemas"]["IndexSeries"];
            /** Years */
            years: components["schemas"]["YearReturnsDTO"][];
        };
        /** Body_preview_api_import_preview_post */
        Body_preview_api_import_preview_post: {
            /** Files */
            files: Blob[];
        };
        /**
         * BreakEvenRateDTO
         * @description A taxa no formato do indexador; nula quando nenhuma empata.
         */
        BreakEvenRateDTO: {
            product_type: components["schemas"]["FixedIncomeType"];
            indexer: components["schemas"]["Indexer"];
            /** Rate */
            rate: DecimalString | null;
        };
        /**
         * CategoryAllocationDTO
         * @description `cost` é o custo da renda variável e o principal da renda fixa. A variação
         *     do dia é nula quando nenhum item da categoria tem uma.
         */
        CategoryAllocationDTO: {
            category: components["schemas"]["PortfolioCategory"];
            /** Asset Count */
            asset_count: number;
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
            /**
             * Cost
             * Format: decimal
             */
            cost: DecimalString;
            /**
             * Unrealized Result
             * Format: decimal
             */
            unrealized_result: DecimalString;
            /** Unrealized Return */
            unrealized_return: DecimalString | null;
            /** Day Change */
            day_change: DecimalString | null;
            /** Day Return */
            day_return: DecimalString | null;
        };
        /**
         * CategoryAmountDTO
         * @description `share` em fração do total do período: 0,25 é 25%.
         */
        CategoryAmountDTO: {
            category: components["schemas"]["PortfolioCategory"];
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
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
        /** CategoryValueDTO */
        CategoryValueDTO: {
            category: components["schemas"]["PortfolioCategory"];
            /**
             * Value
             * Format: decimal
             */
            value: DecimalString;
        };
        /**
         * ComparisonDTO
         * @description `best` é a posição da opção de maior líquido.
         */
        ComparisonDTO: {
            /** Results */
            results: components["schemas"]["ComparisonResultDTO"][];
            /** Best */
            best: number | null;
            /** Points */
            points: components["schemas"]["ComparisonPointDTO"][];
        };
        /** ComparisonInDTO */
        ComparisonInDTO: {
            /** Options */
            options: components["schemas"]["ComparisonOptionInDTO"][];
            projection: components["schemas"]["ProjectionInDTO"];
        };
        /** ComparisonOptionInDTO */
        ComparisonOptionInDTO: {
            product_type: components["schemas"]["FixedIncomeType"];
            indexer: components["schemas"]["Indexer"];
            /**
             * Rate
             * Format: decimal
             */
            rate: DecimalString;
            /** Label */
            label: string;
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
            /**
             * Application Date
             * Format: date
             */
            application_date: string;
            /**
             * Redemption Date
             * Format: date
             */
            redemption_date: string;
        };
        /**
         * ComparisonPointDTO
         * @description O líquido de cada opção, na ordem das opções: nulo antes da aplicação.
         */
        ComparisonPointDTO: {
            /**
             * Day
             * Format: date
             */
            day: string;
            /** Net Values */
            net_values: (DecimalString | null)[];
        };
        /**
         * ComparisonResultDTO
         * @description `income_tax_rate` nulo no título isento. `cdi_equivalent` em % do CDI: o de
         *     um CDB tributado, nas mesmas datas, que entrega o mesmo líquido.
         */
        ComparisonResultDTO: {
            /** Label */
            label: string;
            /** Calendar Days */
            calendar_days: number;
            /** Business Days */
            business_days: number;
            /**
             * Gross Value
             * Format: decimal
             */
            gross_value: DecimalString;
            /**
             * Iof
             * Format: decimal
             */
            iof: DecimalString;
            /**
             * Income Tax
             * Format: decimal
             */
            income_tax: DecimalString;
            /**
             * Net Value
             * Format: decimal
             */
            net_value: DecimalString;
            /**
             * Net Gain
             * Format: decimal
             */
            net_gain: DecimalString;
            /** Income Tax Rate */
            income_tax_rate: DecimalString | null;
            /**
             * Iof Rate
             * Format: decimal
             */
            iof_rate: DecimalString;
            /** Net Annual Return */
            net_annual_return: DecimalString | null;
            /** Cdi Equivalent */
            cdi_equivalent: DecimalString | null;
        };
        /**
         * CurrentRatesDTO
         * @description O último valor real de cada série, em % ao ano: o CDI e a Selic do último
         *     dia, anualizados, e o IPCA dos últimos 12 meses. Nulo sem dado no cache.
         */
        CurrentRatesDTO: {
            /** Cdi */
            cdi: DecimalString | null;
            /** Cdi Date */
            cdi_date: string | null;
            /** Selic */
            selic: DecimalString | null;
            /** Selic Date */
            selic_date: string | null;
            /** Ipca */
            ipca: DecimalString | null;
            /** Ipca Date */
            ipca_date: string | null;
        };
        /** CurvePointDTO */
        CurvePointDTO: {
            /** Installments */
            installments: number;
            /**
             * Break Even Discount
             * Format: decimal
             */
            break_even_discount: DecimalString;
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
         * DataIssueDTO
         * @description Um problema de dado que afeta algum número: o que falta, o que fica errado
         *     por causa disso e a tela (`path`) onde ele se corrige.
         */
        DataIssueDTO: {
            kind: components["schemas"]["DataIssueKind"];
            /** Subject */
            subject: string;
            /** Missing */
            missing: string;
            /** Affects */
            affects: string;
            /** Path */
            path: string;
        };
        /**
         * DataIssueKind
         * @description Os tipos de problema de dado que afetam algum número do app.
         * @enum {string}
         */
        DataIssueKind: "missing_prices" | "late_series" | "fixed_income_without_application" | "missing_cnpj" | "unclassified_asset";
        /**
         * ErrorResponse
         * @description O envelope único de erro: todo 4xx/5xx sai assim, com `detail` sempre string.
         */
        ErrorResponse: {
            /** Detail */
            detail: string;
        };
        /**
         * EvolutionDTO
         * @description `total` e o crescimento contam até hoje, e o crescimento é nulo quando a
         *     carteira é mais nova que ele. As categorias são as da carteira toda, com o
         *     valor de hoje.
         */
        EvolutionDTO: {
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
            last_6_months: components["schemas"]["GrowthDTO"] | null;
            last_12_months: components["schemas"]["GrowthDTO"] | null;
            last_24_months: components["schemas"]["GrowthDTO"] | null;
            /** Categories */
            categories: components["schemas"]["CategoryValueDTO"][];
            /** Points */
            points: components["schemas"]["EvolutionPointDTO"][];
        };
        /**
         * EvolutionPointDTO
         * @description `invested` é o que entrou menos o que saiu até o dia, e `gain` é o
         *     patrimônio menos ele.
         */
        EvolutionPointDTO: {
            /**
             * Day
             * Format: date
             */
            day: string;
            /**
             * Value
             * Format: decimal
             */
            value: DecimalString;
            /**
             * Invested
             * Format: decimal
             */
            invested: DecimalString;
            /**
             * Gain
             * Format: decimal
             */
            gain: DecimalString;
        };
        /**
         * FixedIncomeCreateDTO
         * @description O título nasce com a primeira aplicação.
         */
        FixedIncomeCreateDTO: {
            /** Label */
            label: string;
            product_type: components["schemas"]["FixedIncomeType"];
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
            application: components["schemas"]["ApplicationInDTO"];
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
            product_type: components["schemas"]["FixedIncomeType"];
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
            product_type: components["schemas"]["FixedIncomeType"];
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
            product_type: components["schemas"]["FixedIncomeType"];
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
             * Unrealized Result
             * Format: decimal
             */
            unrealized_result: DecimalString;
            /** Unrealized Return */
            unrealized_return: DecimalString | null;
            /**
             * Day Change
             * Format: decimal
             */
            day_change: DecimalString;
            /** Day Return */
            day_return: DecimalString | null;
            /**
             * As Of
             * Format: date
             */
            as_of: string;
        };
        /**
         * FixedIncomeInDTO
         * @description Os termos do título. Na Selic, `rate` é o spread, que pode ser zero ou
         *     negativo; nos outros indexadores, é maior que zero.
         */
        FixedIncomeInDTO: {
            /** Label */
            label: string;
            product_type: components["schemas"]["FixedIncomeType"];
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
        };
        /**
         * FixedIncomeMovementType
         * @enum {string}
         */
        FixedIncomeMovementType: "application" | "redemption";
        /**
         * FixedIncomeType
         * @description O produto de renda fixa. Ele decide a isenção de IR e, no Tesouro, o
         *     indexador.
         * @enum {string}
         */
        FixedIncomeType: "cdb" | "rdb" | "lc" | "lci" | "lca" | "cri" | "cra" | "debenture" | "incentivized_debenture" | "treasury_selic" | "treasury_prefixed" | "treasury_ipca";
        /**
         * GrowthDTO
         * @description A variação do patrimônio, com os aportes e os resgates dentro; o retorno é
         *     em fração e nulo quando o patrimônio de partida é zero.
         */
        GrowthDTO: {
            /**
             * Change
             * Format: decimal
             */
            change: DecimalString;
            /** Growth Return */
            growth_return: DecimalString | null;
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
            /** Income */
            income: components["schemas"]["ImportedIncomeDTO"][];
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
            /** Income Rows */
            income_rows: components["schemas"]["IncomePreviewRowDTO"][];
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
            /** Income Created */
            income_created: number;
            /** Income Skipped */
            income_skipped: number;
            /** Assets Created */
            assets_created: string[];
        };
        /**
         * ImportSource
         * @enum {string}
         */
        ImportSource: "b3" | "b3_income" | "nubank";
        /**
         * ImportStatus
         * @enum {string}
         */
        ImportStatus: "new" | "existing" | "possible_duplicate" | "repeated_in_batch";
        /**
         * ImportedIncomeDTO
         * @description Um provento lido de arquivo, com o valor por unidade bruto e o valor líquido.
         */
        ImportedIncomeDTO: {
            /** Ticker */
            ticker: string;
            /**
             * Payment Date
             * Format: date
             */
            payment_date: string;
            income_type: components["schemas"]["IncomeType"];
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
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
        };
        /**
         * ImportedOperationDTO
         * @description Uma operação lida de arquivo: sai do parser, vai ao preview e volta no
         *     confirmar.
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
         * IncomeAssetDTO
         * @description `amount` e `share` são da janela pedida; `accumulated`, desde sempre.
         *
         *     `dividend_yield` e `yield_on_cost` usam os últimos 12 meses: o líquido pago por
         *     unidade dividido pelo preço de hoje e pelo preço médio. Nulos sem posição, sem
         *     cotação ou sem PM.
         */
        IncomeAssetDTO: {
            /** Asset Id */
            asset_id: number;
            /** Ticker */
            ticker: string;
            category: components["schemas"]["PortfolioCategory"];
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
            /**
             * Share
             * Format: decimal
             */
            share: DecimalString;
            /**
             * Quantity
             * Format: decimal
             */
            quantity: DecimalString;
            /** Dividend Yield */
            dividend_yield: DecimalString | null;
            /** Yield On Cost */
            yield_on_cost: DecimalString | null;
            /**
             * Last Amount
             * Format: decimal
             */
            last_amount: DecimalString;
            /**
             * Last Payment Date
             * Format: date
             */
            last_payment_date: string;
            /**
             * Accumulated
             * Format: decimal
             */
            accumulated: DecimalString;
        };
        /**
         * IncomeBarDTO
         * @description `period` é `2024` na visão por ano e `2024-03` na por mês.
         */
        IncomeBarDTO: {
            /** Period */
            period: string;
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
            /** Categories */
            categories: components["schemas"]["CategoryAmountDTO"][];
        };
        /** IncomeDistributionDTO */
        IncomeDistributionDTO: {
            /** Months */
            months: number;
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
            /** Categories */
            categories: components["schemas"]["CategoryAmountDTO"][];
            /** Assets */
            assets: components["schemas"]["IncomeAssetDTO"][];
        };
        /**
         * IncomeEventDTO
         * @description `unit_price` é o bruto por unidade, e `amount` o líquido recebido.
         */
        IncomeEventDTO: {
            /** Id */
            id: number;
            /** Asset Id */
            asset_id: number;
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
            /**
             * Payment Date
             * Format: date
             */
            payment_date: string;
            income_type: components["schemas"]["IncomeType"];
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
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
        };
        /** IncomeEventInDTO */
        IncomeEventInDTO: {
            /** Asset Id */
            asset_id: number;
            /**
             * Payment Date
             * Format: date
             */
            payment_date: string;
            income_type: components["schemas"]["IncomeType"];
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
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
        };
        /**
         * IncomeForm
         * @description A ficha do IRPF em que o provento entra.
         * @enum {string}
         */
        IncomeForm: "exempt" | "exclusive";
        /** IncomeListDTO */
        IncomeListDTO: {
            /** Events */
            events: components["schemas"]["IncomeEventDTO"][];
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
        };
        /**
         * IncomePerformanceDTO
         * @description `total` e os recentes contam desde o primeiro provento até hoje; as barras e as
         *     categorias, só o período pedido.
         */
        IncomePerformanceDTO: {
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
            /**
             * Last 6 Months
             * Format: decimal
             */
            last_6_months: DecimalString;
            /**
             * Last 12 Months
             * Format: decimal
             */
            last_12_months: DecimalString;
            /**
             * Last 24 Months
             * Format: decimal
             */
            last_24_months: DecimalString;
            /**
             * Period Total
             * Format: decimal
             */
            period_total: DecimalString;
            /** Bars */
            bars: components["schemas"]["IncomeBarDTO"][];
            /** Categories */
            categories: components["schemas"]["CategoryAmountDTO"][];
        };
        /** IncomePreviewRowDTO */
        IncomePreviewRowDTO: {
            /** Ticker */
            ticker: string;
            /**
             * Payment Date
             * Format: date
             */
            payment_date: string;
            income_type: components["schemas"]["IncomeType"];
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
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
            /** File */
            file: string;
            status: components["schemas"]["ImportStatus"];
        };
        /**
         * IncomeType
         * @enum {string}
         */
        IncomeType: "dividend" | "jcp" | "distribution";
        /**
         * IndexSeries
         * @enum {string}
         */
        IndexSeries: "cdi" | "selic" | "ipca" | "ibov";
        /**
         * Indexer
         * @enum {string}
         */
        Indexer: "cdi" | "selic" | "ipca" | "prefixed";
        /**
         * InstallmentMode
         * @description Compra: o valor é o preço, dividido nas parcelas. Adiantamento: o valor é o de
         *     cada parcela que falta.
         * @enum {string}
         */
        InstallmentMode: "purchase" | "prepayment";
        /**
         * InstallmentsDTO
         * @description As sobras são o que cada caminho deixa no último vencimento, líquido.
         *     `difference` é a sobra do vencedor menos a do outro.
         */
        InstallmentsDTO: {
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
            /** Cash Price */
            cash_price: DecimalString | null;
            /** Withdrawals */
            withdrawals: components["schemas"]["WithdrawalDTO"][];
            /**
             * Installments Leftover
             * Format: decimal
             */
            installments_leftover: DecimalString;
            /** Cash Leftover */
            cash_leftover: DecimalString | null;
            winner: components["schemas"]["PaymentChoice"] | null;
            /** Difference */
            difference: DecimalString | null;
            /**
             * Break Even Discount
             * Format: decimal
             */
            break_even_discount: DecimalString;
            /** Break Even Rates */
            break_even_rates: components["schemas"]["BreakEvenRateDTO"][] | null;
            /** Balance */
            balance: components["schemas"]["BalancePointDTO"][];
            /** Curve */
            curve: components["schemas"]["CurvePointDTO"][];
        };
        /**
         * InstallmentsInDTO
         * @description `amount` segue o `mode`: o preço na compra, a parcela no adiantamento.
         *     `cash_discount` em %, opcional: sem ele, sai só o desconto de empate.
         */
        InstallmentsInDTO: {
            mode: components["schemas"]["InstallmentMode"];
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
            /** Installments */
            installments: number;
            /**
             * Start Date
             * Format: date
             */
            start_date: string;
            /**
             * First Due Date
             * Format: date
             */
            first_due_date: string;
            /** Cash Discount */
            cash_discount?: DecimalString | null;
            investment: components["schemas"]["InvestmentInDTO"];
            projection: components["schemas"]["ProjectionInDTO"];
        };
        /** InvestmentInDTO */
        InvestmentInDTO: {
            product_type: components["schemas"]["FixedIncomeType"];
            indexer: components["schemas"]["Indexer"];
            /**
             * Rate
             * Format: decimal
             */
            rate: DecimalString;
        };
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
        /**
         * IrpfIncomeDTO
         * @description O líquido que um ativo pagou no ano num tipo de provento. `form` e `code` são
         *     nulos quando o provento não tem ficha automática.
         */
        IrpfIncomeDTO: {
            /** Asset Id */
            asset_id: number;
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
            /** Cnpj */
            cnpj: string | null;
            income_type: components["schemas"]["IncomeType"];
            form: components["schemas"]["IncomeForm"] | null;
            /** Code */
            code: string | null;
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
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
            /** Income */
            income: components["schemas"]["IrpfIncomeDTO"][];
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
        /** MonthReturnDTO */
        MonthReturnDTO: {
            /** Year */
            year: number;
            /** Month */
            month: number;
            /**
             * Value
             * Format: decimal
             */
            value: DecimalString;
        };
        /**
         * MonthlyPerformanceDTO
         * @description Retornos em fração, de fechamento a fechamento de cada mês. As contagens são
         *     dos meses da carteira, de um total de `months`.
         */
        MonthlyPerformanceDTO: {
            /** Years */
            years: components["schemas"]["YearReturnsDTO"][];
            /** Benchmarks */
            benchmarks: components["schemas"]["BenchmarkYearsDTO"][];
            best_month: components["schemas"]["MonthReturnDTO"] | null;
            worst_month: components["schemas"]["MonthReturnDTO"] | null;
            /** Months */
            months: number;
            /** Positive Months */
            positive_months: number;
            /** Negative Months */
            negative_months: number;
        };
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
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
            movement_type: components["schemas"]["FixedIncomeMovementType"];
        };
        /**
         * NameInDTO
         * @description O nome de um setor ou de um segmento.
         */
        NameInDTO: {
            /** Name */
            name: string;
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
         * @description Compra, venda e evento corporativo.
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
        OperationType: "buy" | "sell" | "bonus" | "split" | "reverse_split";
        /**
         * PaymentChoice
         * @enum {string}
         */
        PaymentChoice: "cash" | "installments";
        /**
         * PerformanceDTO
         * @description Retornos em fração (0,1 é 10%), pela variação da cota, sem contar aportes e
         *     resgates. `start` é o dia cujo fechamento é a base do período, nulo quando ele
         *     começa com a carteira, e os pontos acumulam desde essa base. Os retornos
         *     recentes contam até hoje e são nulos quando a carteira é mais nova que eles.
         *     `cdi_share` é o retorno do período sobre o do CDI: 1,2 é 120% do CDI.
         */
        PerformanceDTO: {
            /** First Date */
            first_date: string | null;
            /** Start */
            start: string | null;
            /** End */
            end: string | null;
            /** Since Inception */
            since_inception: DecimalString | null;
            /** Period */
            period: DecimalString | null;
            /** Last 6 Months */
            last_6_months: DecimalString | null;
            /** Last 12 Months */
            last_12_months: DecimalString | null;
            /** Last 24 Months */
            last_24_months: DecimalString | null;
            /** Points */
            points: components["schemas"]["ReturnPointDTO"][];
            /** Cdi Share */
            cdi_share: DecimalString | null;
            /** Benchmarks */
            benchmarks: components["schemas"]["BenchmarkReturnDTO"][];
        };
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
         * @description Frações (`share`, `unrealized_return`, `day_return`) vão de 0 a 1. A de setor
         *     e segmento é sobre o total da renda variável.
         *
         *     A variação do dia da renda variável compara o fechamento de `price_date`, o
         *     pregão mais recente do cache, com o de `previous_price_date`; a da renda fixa é
         *     a marcação de hoje contra a do dia útil anterior.
         */
        PortfolioDTO: {
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
            /** Day Change */
            day_change: DecimalString | null;
            /** Day Return */
            day_return: DecimalString | null;
            /** Price Date */
            price_date: string | null;
            /** Previous Price Date */
            previous_price_date: string | null;
            /** Categories */
            categories: components["schemas"]["CategoryAllocationDTO"][];
            /** Positions */
            positions: components["schemas"]["PositionDTO"][];
            /** Fixed Income */
            fixed_income: components["schemas"]["FixedIncomeHoldingDTO"][];
            /** Sectors */
            sectors: components["schemas"]["SectorAllocationDTO"][];
            /** Segments */
            segments: components["schemas"]["SegmentAllocationDTO"][];
        };
        /**
         * PositionDTO
         * @description `price` nulo é ativo sem cotação em cache, valorado pelo custo. A variação do
         *     dia é nula quando o ativo não tem o fechamento do pregão mais recente, ou não
         *     tem o anterior a ele.
         */
        PositionDTO: {
            /** Asset Id */
            asset_id: number;
            /** Ticker */
            ticker: string;
            asset_class: components["schemas"]["AssetClass"];
            /** Sector */
            sector: string | null;
            /** Segment */
            segment: string | null;
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
            /** Day Change */
            day_change: DecimalString | null;
            /** Day Return */
            day_return: DecimalString | null;
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
        /**
         * PreviousTickerDTO
         * @description Um ticker antigo, vigente até `valid_until`, inclusive.
         */
        PreviousTickerDTO: {
            /** Ticker */
            ticker: string;
            /**
             * Valid Until
             * Format: date
             */
            valid_until: string;
        };
        /**
         * ProjectionInDTO
         * @description As taxas ao ano, em %, que valem depois do último dado real de cada série.
         */
        ProjectionInDTO: {
            /**
             * Cdi
             * Format: decimal
             */
            cdi: DecimalString;
            /**
             * Selic
             * Format: decimal
             */
            selic: DecimalString;
            /**
             * Ipca
             * Format: decimal
             */
            ipca: DecimalString;
        };
        /** RefreshReportDTO */
        RefreshReportDTO: {
            /** Updated */
            updated: string[];
            /** Failed */
            failed: string[];
        };
        /** ReturnPointDTO */
        ReturnPointDTO: {
            /**
             * Day
             * Format: date
             */
            day: string;
            /**
             * Cumulative Return
             * Format: decimal
             */
            cumulative_return: DecimalString;
        };
        /**
         * SectorAllocationDTO
         * @description `sector` nulo é o que está sem classificação.
         */
        SectorAllocationDTO: {
            /** Sector */
            sector: string | null;
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
        /** SectorDTO */
        SectorDTO: {
            /** Id */
            id: number;
            /** Name */
            name: string;
            /** Segments */
            segments: components["schemas"]["SegmentDTO"][];
        };
        /** SegmentAllocationDTO */
        SegmentAllocationDTO: {
            /** Sector */
            sector: string | null;
            /** Segment */
            segment: string | null;
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
        /** SegmentDTO */
        SegmentDTO: {
            /** Id */
            id: number;
            /** Sector Id */
            sector_id: number;
            /** Name */
            name: string;
            /** Asset Count */
            asset_count: number;
        };
        /**
         * TickerChangeInDTO
         * @description A troca de ticker: o ativo passa a se chamar `ticker` a partir de
         *     `effective_date`, inclusive.
         */
        TickerChangeInDTO: {
            /** Ticker */
            ticker: string;
            /**
             * Effective Date
             * Format: date
             */
            effective_date: string;
        };
        /**
         * TradeType
         * @description Operação comum (a posição atravessa o dia) ou day trade.
         * @enum {string}
         */
        TradeType: "swing" | "day_trade";
        /** WithdrawalDTO */
        WithdrawalDTO: {
            /**
             * Due Date
             * Format: date
             */
            due_date: string;
            /**
             * Withdrawn On
             * Format: date
             */
            withdrawn_on: string;
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
            /**
             * Gross
             * Format: decimal
             */
            gross: DecimalString;
            /**
             * Iof
             * Format: decimal
             */
            iof: DecimalString;
            /**
             * Income Tax
             * Format: decimal
             */
            income_tax: DecimalString;
        };
        /**
         * YearReturnsDTO
         * @description `months` tem 12 posições, de janeiro a dezembro, nulas fora da série.
         */
        YearReturnsDTO: {
            /** Year */
            year: number;
            /** Months */
            months: (DecimalString | null)[];
            /**
             * Year Return
             * Format: decimal
             */
            year_return: DecimalString;
            /**
             * Accumulated
             * Format: decimal
             */
            accumulated: DecimalString;
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
    preview_api_import_preview_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_preview_api_import_preview_post"];
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
    confirm_api_import_confirm_post: {
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
    list_all_api_income_get: {
        parameters: {
            query?: {
                asset_id?: number | null;
                category?: components["schemas"]["PortfolioCategory"] | null;
                income_type?: components["schemas"]["IncomeType"] | null;
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
                    "application/json": components["schemas"]["IncomeListDTO"];
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
    create_api_income_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IncomeEventInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IncomeEventDTO"];
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
    update_api_income__income_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                income_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IncomeEventInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IncomeEventDTO"];
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
    delete_api_income__income_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                income_id: number;
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
    get_performance_api_income_performance_get: {
        parameters: {
            query?: {
                group?: "month" | "year";
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
                    "application/json": components["schemas"]["IncomePerformanceDTO"];
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
    get_distribution_api_income_distribution_get: {
        parameters: {
            query?: {
                months?: number;
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
                    "application/json": components["schemas"]["IncomeDistributionDTO"];
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
    ticker_change_api_assets__asset_id__ticker_change_post: {
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
                "application/json": components["schemas"]["TickerChangeInDTO"];
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
    list_all_api_sectors_get: {
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
                    "application/json": components["schemas"]["SectorDTO"][];
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
    create_api_sectors_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NameInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SectorDTO"];
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
    rename_api_sectors__sector_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sector_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NameInDTO"];
            };
        };
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
    delete_api_sectors__sector_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sector_id: number;
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
    add_segment_api_sectors__sector_id__segments_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sector_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NameInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SegmentDTO"];
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
    rename_one_segment_api_sectors_segments__segment_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                segment_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NameInDTO"];
            };
        };
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
    remove_segment_api_sectors_segments__segment_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                segment_id: number;
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
    get_performance_api_performance_get: {
        parameters: {
            query?: {
                category?: components["schemas"]["PortfolioCategory"] | null;
                asset_id?: number | null;
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
                    "application/json": components["schemas"]["PerformanceDTO"];
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
    get_monthly_performance_api_performance_monthly_get: {
        parameters: {
            query?: {
                category?: components["schemas"]["PortfolioCategory"] | null;
                asset_id?: number | null;
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
                    "application/json": components["schemas"]["MonthlyPerformanceDTO"];
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
    get_evolution_api_evolution_get: {
        parameters: {
            query?: {
                category?: components["schemas"]["PortfolioCategory"] | null;
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
                    "application/json": components["schemas"]["EvolutionDTO"];
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
                "application/json": components["schemas"]["FixedIncomeCreateDTO"];
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
    list_issues_api_data_health_get: {
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
                    "application/json": components["schemas"]["DataIssueDTO"][];
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
    current_api_simulation_rates_get: {
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
                    "application/json": components["schemas"]["CurrentRatesDTO"];
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
    fixed_income_api_simulation_fixed_income_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ComparisonInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ComparisonDTO"];
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
    installments_api_simulation_installments_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InstallmentsInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InstallmentsDTO"];
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
