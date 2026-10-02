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
    "/api/market/tickers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Search
         * @description Os tickers da B3 que a busca do yfinance associa ao texto, para sugerir
         *     enquanto se digita. Menos de 2 caracteres devolve a lista vazia sem consultar a
         *     fonte, e a fonte fora do ar dá 503.
         */
        get: operations["search_api_market_tickers_get"];
        put?: never;
        post?: never;
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
    "/api/classification/suggestion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Suggestion
         * @description O setor e o segmento sugeridos para o ticker. Nulo quando a fonte não conhece o
         *     ticker ou não o classifica; a fonte fora do ar, sem perfil em cache, dá 503.
         */
        get: operations["suggestion_api_classification_suggestion_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/classification/pending": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Pending */
        get: operations["list_pending_api_classification_pending_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/classification/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Accept All */
        post: operations["accept_all_api_classification_accept_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/subportfolios": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List All */
        get: operations["list_all_api_subportfolios_get"];
        put?: never;
        /** Create */
        post: operations["create_api_subportfolios_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/subportfolios/division": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Division
         * @description Como a carteira se divide entre as subcarteiras e o que está fora delas.
         */
        get: operations["get_division_api_subportfolios_division_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/subportfolios/{subportfolio_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update */
        put: operations["update_api_subportfolios__subportfolio_id__put"];
        post?: never;
        /** Delete */
        delete: operations["delete_api_subportfolios__subportfolio_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/subportfolios/{subportfolio_id}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update Members */
        put: operations["update_members_api_subportfolios__subportfolio_id__members_put"];
        post?: never;
        delete?: never;
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
    "/api/rebalance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Rebalance
         * @description A meta de uma subcarteira ou, sem `subportfolio_id`, a combinada da geral.
         */
        get: operations["get_rebalance_api_rebalance_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/rebalance/plan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Get Plan
         * @description Conta sobre o aporte enviado, sem gravar nada.
         */
        post: operations["get_plan_api_rebalance_plan_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/rebalance/{subportfolio_id}/targets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read Targets */
        get: operations["read_targets_api_rebalance__subportfolio_id__targets_get"];
        /** Write Targets */
        put: operations["write_targets_api_rebalance__subportfolio_id__targets_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/alert/schedule": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Schedule */
        get: operations["get_schedule_api_alert_schedule_get"];
        /**
         * Put Schedule
         * @description Cria a tarefa diária no horário, ou troca o horário da que existe.
         */
        put: operations["put_schedule_api_alert_schedule_put"];
        post?: never;
        /** Delete Schedule */
        delete: operations["delete_schedule_api_alert_schedule_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/alert/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run
         * @description Roda a tarefa agendada agora, pelo próprio Agendador.
         */
        post: operations["run_api_alert_run_post"];
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
    "/api/risk-return": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Risk Return */
        get: operations["get_risk_return_api_risk_return_get"];
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
    "/api/fixed-income/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Summary */
        get: operations["summary_api_fixed_income_summary_get"];
        put?: never;
        post?: never;
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
    "/api/cash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get */
        get: operations["get_api_cash_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cash/checks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Check */
        post: operations["create_check_api_cash_checks_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cash/checks/{check_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Remove Check */
        delete: operations["remove_check_api_cash_checks__check_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cash/withdrawals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Withdrawal */
        post: operations["create_withdrawal_api_cash_withdrawals_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cash/withdrawals/{withdrawal_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Remove Withdrawal */
        delete: operations["remove_withdrawal_api_cash_withdrawals__withdrawal_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cash/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Put Settings */
        put: operations["put_settings_api_cash_settings_put"];
        post?: never;
        delete?: never;
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
    "/api/correlation/pair": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pair
         * @description Cada lado é um ticker da B3 ou uma referência (`IBOV`, `CDI`). Grava no cache
         *     o que a fonte trouxer; com o cache em dia, responde sem sair da máquina.
         */
        get: operations["pair_api_correlation_pair_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/correlation/matrix": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Correlation Matrix
         * @description A correlação de cada par entre 2 e 20 tickers ou referências.
         */
        get: operations["correlation_matrix_api_correlation_matrix_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/correlation/portfolio": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Portfolio Correlation
         * @description A matriz dos ativos em carteira, com IBOV e CDI no fim quando pedidos em
         *     `benchmarks`.
         */
        get: operations["portfolio_correlation_api_correlation_portfolio_get"];
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
        /** AcceptInDTO */
        AcceptInDTO: {
            /** Items */
            items: components["schemas"]["AcceptItemDTO"][];
        };
        /** AcceptItemDTO */
        AcceptItemDTO: {
            /** Asset Id */
            asset_id: number;
            /** Segment Id */
            segment_id: number;
        };
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
         *     nomes vindos do segmento. `subportfolio_id` nulo é ativo só da carteira geral.
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
            /** Subportfolio Id */
            subportfolio_id: number | null;
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
            /** Subportfolio Id */
            subportfolio_id?: number | null;
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
        /**
         * AssetTargetDTO
         * @description A meta do ativo em percentual: 30 é 30% da subcarteira.
         */
        AssetTargetDTO: {
            /** Asset Id */
            asset_id: number;
            /** Ticker */
            ticker: string;
            /**
             * Target
             * Format: decimal
             */
            target: DecimalString;
        };
        /** AssetTargetInDTO */
        AssetTargetInDTO: {
            /** Asset Id */
            asset_id: number;
            /**
             * Target
             * Format: decimal
             */
            target: DecimalString;
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
         * CashCheckInDTO
         * @description O saldo do extrato no fim do dia.
         */
        CashCheckInDTO: {
            /**
             * Check Date
             * Format: date
             */
            check_date: string;
            /**
             * Balance
             * Format: decimal
             */
            balance: DecimalString;
        };
        /**
         * CashDTO
         * @description `balance` e `opened_on` são nulos antes da primeira conferência. O extrato
         *     vem do mais recente para o mais antigo. `above_threshold` é o saldo parado que
         *     aparece nas pendências, e `above_since` o dia em que ele passou do limite.
         */
        CashDTO: {
            /** Opened On */
            opened_on: string | null;
            /** Balance */
            balance: DecimalString | null;
            /**
             * Alert Threshold
             * Format: decimal
             */
            alert_threshold: DecimalString;
            /** Above Threshold */
            above_threshold: boolean;
            /** Above Since */
            above_since: string | null;
            /** Entries */
            entries: components["schemas"]["CashEntryDTO"][];
        };
        /**
         * CashEntryDTO
         * @description Uma linha do extrato derivado. `amount` é o efeito no saldo, com sinal, e
         *     `record_id` é a conferência ou o saque gravado que gerou a linha.
         */
        CashEntryDTO: {
            /**
             * Entry Date
             * Format: date
             */
            entry_date: string;
            kind: components["schemas"]["CashEntryKind"];
            /** Label */
            label: string | null;
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
            /**
             * Balance
             * Format: decimal
             */
            balance: DecimalString;
            /** Record Id */
            record_id: number | null;
        };
        /**
         * CashEntryKind
         * @description O que moveu o saldo de investimento. `deposit` é o aporte de fora que cobre a
         *     compra maior que o saldo, e `check` é a conferência com o extrato, pela
         *     diferença contra o saldo derivado.
         * @enum {string}
         */
        CashEntryKind: "opening" | "sale" | "income" | "redemption" | "maturity" | "deposit" | "purchase" | "application" | "withdrawal" | "check";
        /** CashSettingsInDTO */
        CashSettingsInDTO: {
            /**
             * Alert Threshold
             * Format: decimal
             */
            alert_threshold: DecimalString;
        };
        /** CashWithdrawalInDTO */
        CashWithdrawalInDTO: {
            /**
             * Withdrawal Date
             * Format: date
             */
            withdrawal_date: string;
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
        };
        /** CategoryAllocationDTO */
        CategoryAllocationDTO: {
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
            category: components["schemas"]["PortfolioCategory"];
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
        /** CorrelatedPairDTO */
        CorrelatedPairDTO: {
            /** First */
            first: string;
            /** Second */
            second: string;
            /** Value */
            value: number;
            /** Returns */
            returns: number;
        };
        /**
         * CorrelationDTO
         * @description A correlação de Pearson dos retornos diários, de -1 a 1, sobre `returns`
         *     retornos nos pregões em comum de `start` a `end`. `points` são as duas séries
         *     partindo de 100, e `rolling`, a correlação das `rolling_window` sessões que
         *     terminam em cada dia.
         */
        CorrelationDTO: {
            /** First */
            first: string;
            /** Second */
            second: string;
            /** Correlation */
            correlation: number;
            /** Returns */
            returns: number;
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
            /** Rolling Window */
            rolling_window: number;
            /** Points */
            points: components["schemas"]["NormalizedPointDTO"][];
            /** Rolling */
            rolling: components["schemas"]["RollingPointDTO"][];
        };
        /**
         * CorrelationMatrixDTO
         * @description `cells[i][j]` é a correlação entre `symbols[i]` e `symbols[j]`.
         */
        CorrelationMatrixDTO: {
            /** Symbols */
            symbols: string[];
            /** Cells */
            cells: components["schemas"]["MatrixCellDTO"][][];
        };
        /**
         * CorrelationWindow
         * @enum {string}
         */
        CorrelationWindow: "6m" | "1y" | "3y" | "5y";
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
         * @description Uma pendência: o que falta, o que fica errado por causa disso e a tela
         *     (`path`) onde ela se resolve. A gravidade vem do tipo.
         */
        DataIssueDTO: {
            kind: components["schemas"]["DataIssueKind"];
            severity: components["schemas"]["Severity"];
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
         * @description As pendências do app: o DARF a pagar e os problemas de dado que afetam algum
         *     número.
         * @enum {string}
         */
        DataIssueKind: "darf_due" | "missing_prices" | "late_series" | "fixed_income_without_application" | "missing_cnpj" | "unclassified_asset" | "idle_cash" | "rebalance_breach";
        /**
         * DivisionDTO
         * @description Como a carteira se divide: as subcarteiras em ordem de nome e, por último, o
         *     que ficou fora delas.
         */
        DivisionDTO: {
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
            /** Slices */
            slices: components["schemas"]["DivisionSliceDTO"][];
        };
        /**
         * DivisionSliceDTO
         * @description Uma fatia da carteira: `subportfolio_id` nulo é o que está fora de qualquer
         *     subcarteira, o saldo incluído. `share` é a fração de 0 a 1 da carteira.
         */
        DivisionSliceDTO: {
            /** Subportfolio Id */
            subportfolio_id: number | null;
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
         *     carteira é mais nova que ele. As categorias são as da carteira ou da
         *     subcarteira inteira, sem o filtro de categoria, com o valor de hoje.
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
            /** Subportfolio Id */
            subportfolio_id?: number | null;
            application: components["schemas"]["ApplicationInDTO"];
        };
        /**
         * FixedIncomeDTO
         * @description O título com a marcação em `as_of`: hoje, ou o vencimento se já passou. O
         *     título vencido (`matured`) foi resgatado para o saldo e vale zero.
         *     `subportfolio_id` nulo é título só da carteira geral.
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
            /** Subportfolio Id */
            subportfolio_id: number | null;
            /** Tax Exempt */
            tax_exempt: boolean;
            /** Matured */
            matured: boolean;
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
            /** Subportfolio Id */
            subportfolio_id: number | null;
            /** Tax Exempt */
            tax_exempt: boolean;
            /** Matured */
            matured: boolean;
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
            /** Subportfolio Id */
            subportfolio_id?: number | null;
        };
        /**
         * FixedIncomeMovementType
         * @enum {string}
         */
        FixedIncomeMovementType: "application" | "redemption";
        /**
         * FixedIncomeSummaryDTO
         * @description Os títulos que ainda não venceram, somados no total, por tipo (na ordem dos
         *     tipos) e por liquidez: os de liquidez diária e os que só viram dinheiro no
         *     vencimento. `daily_share` e `at_maturity_share` são as frações do bruto, nulas sem
         *     nenhum título. O vencido já
         *     foi resgatado para o saldo e fica fora da soma.
         */
        FixedIncomeSummaryDTO: {
            total: components["schemas"]["FixedIncomeTotalsDTO"];
            /** By Type */
            by_type: components["schemas"]["FixedIncomeTypeTotalsDTO"][];
            daily_liquidity: components["schemas"]["FixedIncomeTotalsDTO"];
            at_maturity: components["schemas"]["FixedIncomeTotalsDTO"];
            /** Daily Share */
            daily_share: DecimalString | null;
            /** At Maturity Share */
            at_maturity_share: DecimalString | null;
        };
        /**
         * FixedIncomeTotalsDTO
         * @description A soma de um grupo de títulos, na marcação de hoje. `gross_result` é o bruto
         *     menos o aplicado, e `gross_return` a fração dele sobre o aplicado.
         */
        FixedIncomeTotalsDTO: {
            /** Count */
            count: number;
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
             * Gross Result
             * Format: decimal
             */
            gross_result: DecimalString;
            /** Gross Return */
            gross_return: DecimalString | null;
        };
        /**
         * FixedIncomeType
         * @description O produto de renda fixa. Ele decide a isenção de IR e, no Tesouro, o
         *     indexador.
         * @enum {string}
         */
        FixedIncomeType: "cdb" | "rdb" | "lc" | "lci" | "lca" | "cri" | "cra" | "debenture" | "incentivized_debenture" | "treasury_selic" | "treasury_prefixed" | "treasury_ipca";
        /** FixedIncomeTypeTotalsDTO */
        FixedIncomeTypeTotalsDTO: {
            /** Count */
            count: number;
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
             * Gross Result
             * Format: decimal
             */
            gross_result: DecimalString;
            /** Gross Return */
            gross_return: DecimalString | null;
            product_type: components["schemas"]["FixedIncomeType"];
        };
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
         * @description `total`, os recentes e `first_payment` contam desde o primeiro provento até
         *     hoje; as barras, as categorias, `payments` e `monthly_average`, só o período
         *     pedido. A média é nula sem nenhum provento.
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
            /** Payments */
            payments: number;
            /** Monthly Average */
            monthly_average: DecimalString | null;
            /** First Payment */
            first_payment: string | null;
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
        /**
         * LatestIndexDTO
         * @description O último valor em cache da série, na unidade dela (% ao dia no CDI e na Selic,
         *     % no mês no IPCA, pontos no IBOV); `annual` é o equivalente em % ao ano, ou os 12
         *     meses no IPCA.
         */
        LatestIndexDTO: {
            series: components["schemas"]["IndexSeries"];
            /** Value */
            value: DecimalString | null;
            /** Rate Date */
            rate_date: string | null;
            /** Annual */
            annual: DecimalString | null;
        };
        /**
         * LiquidityAllocationDTO
         * @description O quanto do patrimônio vira dinheiro em cada prazo: hoje (`daily`: saldo e
         *     renda fixa com liquidez diária), em 2 dias úteis (`intermediate`: renda
         *     variável) e no vencimento (`locked`: renda fixa sem liquidez diária).
         */
        LiquidityAllocationDTO: {
            tier: components["schemas"]["LiquidityTier"];
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
         * LiquidityTier
         * @description O prazo em que o patrimônio vira dinheiro, do mais rápido ao mais lento.
         * @enum {string}
         */
        LiquidityTier: "daily" | "intermediate" | "locked";
        /**
         * LossPool
         * @description Conjunto de operações cujos prejuízos se compensam entre si: as comuns de
         *     ações, ETF e BDR; o day trade delas; e o FII, à parte.
         * @enum {string}
         */
        LossPool: "common" | "day_trade" | "fii";
        /**
         * MatrixCellDTO
         * @description Nula quando o par não tem retornos em comum suficientes ou quando um dos
         *     dois não variou.
         */
        MatrixCellDTO: {
            /** Value */
            value: number | null;
            /** Returns */
            returns: number;
        };
        /**
         * MaturityBucketDTO
         * @description O bruto de hoje dos títulos travados que vencem no período que começa em
         *     `start`; nulo é o travado sem vencimento.
         */
        MaturityBucketDTO: {
            /** Start */
            start: string | null;
            /**
             * Value
             * Format: decimal
             */
            value: DecimalString;
        };
        /** MemberAssetDTO */
        MemberAssetDTO: {
            /** Id */
            id: number;
            /** Ticker */
            ticker: string;
        };
        /** MemberInvestmentDTO */
        MemberInvestmentDTO: {
            /** Id */
            id: number;
            /** Label */
            label: string;
        };
        /**
         * MembersInDTO
         * @description A filiação completa: o que vem aqui passa a ser da subcarteira, inclusive o
         *     que estava em outra, e o que era dela e não veio volta à carteira geral.
         */
        MembersInDTO: {
            /** Asset Ids */
            asset_ids: number[];
            /** Investment Ids */
            investment_ids: number[];
        };
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
         * @description O nome de uma entidade nomeada, como setor, segmento ou subcarteira.
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
        /** NormalizedPointDTO */
        NormalizedPointDTO: {
            /**
             * Day
             * Format: date
             */
            day: string;
            /** First */
            first: number;
            /** Second */
            second: number;
        };
        /**
         * OperationDTO
         * @description `total` é a quantidade vezes o preço unitário; zero nos eventos corporativos.
         */
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
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
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
         * OrderDTO
         * @description Compra (positiva) ou venda (negativa) de um item. `quantity` é o número
         *     inteiro de cotas, nulo na renda fixa e no ativo sem cotação.
         */
        OrderDTO: {
            /** Asset Id */
            asset_id: number | null;
            /** Label */
            label: string;
            category: components["schemas"]["PortfolioCategory"];
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
            /** Quantity */
            quantity: DecimalString | null;
            /** Price */
            price: DecimalString | null;
            /**
             * Share After
             * Format: decimal
             */
            share_after: DecimalString;
        };
        /**
         * PaymentChoice
         * @enum {string}
         */
        PaymentChoice: "cash" | "installments";
        /**
         * PendingDTO
         * @description `source_unavailable` diz que a fonte parou de responder no meio: os ativos sem
         *     perfil em cache ficam sem sugestão até a próxima consulta.
         */
        PendingDTO: {
            /** Items */
            items: components["schemas"]["PendingItemDTO"][];
            /** Source Unavailable */
            source_unavailable: boolean;
        };
        /** PendingItemDTO */
        PendingItemDTO: {
            /** Asset Id */
            asset_id: number;
            /** Ticker */
            ticker: string;
            suggestion: components["schemas"]["SuggestionDTO"] | null;
        };
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
         * PlanDTO
         * @description A sugestão para o aporte. `leftover` é o que sobra do arredondamento em
         *     cotas, e fica no saldo; `used` é o que a sugestão usa do aporte. `total_before`
         *     e `total_after` são o patrimônio da subcarteira antes e depois; `sells_equity`
         *     avisa que alguma venda de renda variável pode gerar DARF.
         */
        PlanDTO: {
            /** Orders */
            orders: components["schemas"]["OrderDTO"][];
            /** Lines */
            lines: components["schemas"]["PlanLineDTO"][];
            /**
             * Total Before
             * Format: decimal
             */
            total_before: DecimalString;
            /**
             * Total After
             * Format: decimal
             */
            total_after: DecimalString;
            /**
             * Used
             * Format: decimal
             */
            used: DecimalString;
            /**
             * Leftover
             * Format: decimal
             */
            leftover: DecimalString;
            /**
             * Imbalance Before
             * Format: decimal
             */
            imbalance_before: DecimalString;
            /**
             * Imbalance After
             * Format: decimal
             */
            imbalance_after: DecimalString;
            /** Sells Equity */
            sells_equity: boolean;
        };
        /**
         * PlanInDTO
         * @description O aporte a dividir. Com `allow_sales`, a divisão também vende o que passou da
         *     meta, menos a renda fixa que só vira dinheiro no vencimento.
         */
        PlanInDTO: {
            /** Subportfolio Id */
            subportfolio_id: number;
            /**
             * Amount
             * Format: decimal
             */
            amount: DecimalString;
            /**
             * Allow Sales
             * @default false
             */
            allow_sales: boolean;
        };
        /**
         * PlanLineDTO
         * @description Um item antes e depois da sugestão. As frações são de 0 a 1 sobre o total da
         *     subcarteira de cada momento, e o desvio é a fração menos a meta. `quantity_*` é
         *     o número de cotas, nulo na renda fixa.
         */
        PlanLineDTO: {
            /** Asset Id */
            asset_id: number | null;
            /** Label */
            label: string;
            category: components["schemas"]["PortfolioCategory"];
            /** Quantity Before */
            quantity_before: DecimalString | null;
            /** Quantity After */
            quantity_after: DecimalString | null;
            /**
             * Value Before
             * Format: decimal
             */
            value_before: DecimalString;
            /**
             * Value After
             * Format: decimal
             */
            value_after: DecimalString;
            /**
             * Share Before
             * Format: decimal
             */
            share_before: DecimalString;
            /**
             * Share After
             * Format: decimal
             */
            share_after: DecimalString;
            /**
             * Target
             * Format: decimal
             */
            target: DecimalString;
            /**
             * Deviation Before
             * Format: decimal
             */
            deviation_before: DecimalString;
            /**
             * Deviation After
             * Format: decimal
             */
            deviation_after: DecimalString;
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
         *     `AssetClass`, a renda fixa e o saldo de investimento.
         * @enum {string}
         */
        PortfolioCategory: "stock" | "fii" | "etf" | "bdr" | "fixed_income" | "cash";
        /**
         * PortfolioCorrelationDTO
         * @description A matriz dos ativos em carteira hoje, em ordem alfabética, e os pares de
         *     maior correlação, do maior para o menor. `missing` são os ativos sem cotação
         *     na janela, com as células vazias.
         */
        PortfolioCorrelationDTO: {
            matrix: components["schemas"]["CorrelationMatrixDTO"];
            /** Pairs */
            pairs: components["schemas"]["CorrelatedPairDTO"][];
            /** Missing */
            missing: string[];
        };
        /**
         * PortfolioDTO
         * @description Frações (`share`, `unrealized_return`, `day_return`) vão de 0 a 1. A de setor
         *     e segmento é sobre o total da renda variável.
         *
         *     A variação do dia da renda variável compara o fechamento de `price_date`, o
         *     pregão mais recente do cache, com o de `previous_price_date`; a da renda fixa é
         *     a marcação de hoje contra a do dia útil anterior.
         *
         *     `cash` é o saldo de investimento, nulo na subcarteira e antes da abertura. O
         *     resultado não realizado é o das categorias investidas, sem o saldo. `equity`
         *     soma a renda variável inteira.
         */
        PortfolioDTO: {
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
            /** Cash */
            cash: DecimalString | null;
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
            /** Price Date */
            price_date: string | null;
            /** Previous Price Date */
            previous_price_date: string | null;
            /** Categories */
            categories: components["schemas"]["CategoryAllocationDTO"][];
            equity: components["schemas"]["SubtotalDTO"] | null;
            /** Positions */
            positions: components["schemas"]["PositionDTO"][];
            /** Fixed Income */
            fixed_income: components["schemas"]["FixedIncomeHoldingDTO"][];
            /** Sectors */
            sectors: components["schemas"]["SectorAllocationDTO"][];
            /** Segments */
            segments: components["schemas"]["SegmentAllocationDTO"][];
            /** Liquidity */
            liquidity: components["schemas"]["LiquidityAllocationDTO"][];
            /** Maturities By Month */
            maturities_by_month: components["schemas"]["MaturityBucketDTO"][];
            /** Maturities By Year */
            maturities_by_year: components["schemas"]["MaturityBucketDTO"][];
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
        /**
         * RebalanceDTO
         * @description A meta de uma subcarteira, ou a combinada da carteira geral. `imbalance` é a
         *     raiz da soma dos quadrados dos desvios, em fração; os limites e os furos só
         *     existem na subcarteira cujas metas somam 100% (`complete`).
         */
        RebalanceDTO: {
            /** Subportfolio Id */
            subportfolio_id: number | null;
            /**
             * Total
             * Format: decimal
             */
            total: DecimalString;
            /** Targets Total */
            targets_total: DecimalString | null;
            /** Complete */
            complete: boolean;
            /** Imbalance */
            imbalance: DecimalString | null;
            /** Max Item Deviation */
            max_item_deviation: DecimalString | null;
            /** Max Total Deviation */
            max_total_deviation: DecimalString | null;
            /** Breached */
            breached: boolean;
            /** Lines */
            lines: components["schemas"]["RebalanceLineDTO"][];
        };
        /**
         * RebalanceLineDTO
         * @description Um item da meta. `asset_id` nulo é a renda fixa da subcarteira ou o saldo.
         *     Frações de 0 a 1: `deviation` é o atual menos a meta (-0.03 é 3 p.p. abaixo),
         *     e `gap` é o que falta em reais para a meta, negativo quando sobra. Na carteira
         *     geral, a meta é a da subcarteira pesada pela fração dela, e o item fora de
         *     subcarteira vem sem meta.
         */
        RebalanceLineDTO: {
            /** Asset Id */
            asset_id: number | null;
            /** Label */
            label: string;
            category: components["schemas"]["PortfolioCategory"];
            /** Subportfolio Id */
            subportfolio_id: number | null;
            /** Subportfolio */
            subportfolio: string | null;
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
            /** Target */
            target: DecimalString | null;
            /** Deviation */
            deviation: DecimalString | null;
            /** Gap */
            gap: DecimalString | null;
            /** Breached */
            breached: boolean;
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
         * RiskItemDTO
         * @description Um ativo ou um título, com o valor no fim do período.
         */
        RiskItemDTO: {
            /** Asset Id */
            asset_id: number | null;
            /** Investment Id */
            investment_id: number | null;
            /** Label */
            label: string;
            category: components["schemas"]["PortfolioCategory"];
            /**
             * Value
             * Format: decimal
             */
            value: DecimalString;
            risk: components["schemas"]["RiskPointDTO"];
        };
        /**
         * RiskPointDTO
         * @description `period_return` em fração (0,1 é 10%), pela variação da cota, com os
         *     proventos. `volatility` também em fração, anualizada, e nula com menos de 20
         *     retornos diários; `returns` é quantos entraram na conta.
         */
        RiskPointDTO: {
            /**
             * Period Return
             * Format: decimal
             */
            period_return: DecimalString;
            /** Volatility */
            volatility: number | null;
            /** Returns */
            returns: number;
        };
        /**
         * RiskReturnDTO
         * @description `start` é o dia cujo fechamento é a base do período, nulo quando ele começa
         *     com a carteira. Cada item conta desde o próprio começo, se for depois.
         */
        RiskReturnDTO: {
            /** Start */
            start: string | null;
            /** End */
            end: string | null;
            portfolio: components["schemas"]["RiskPointDTO"] | null;
            /** Items */
            items: components["schemas"]["RiskItemDTO"][];
        };
        /** RollingPointDTO */
        RollingPointDTO: {
            /**
             * Day
             * Format: date
             */
            day: string;
            /** Value */
            value: number;
        };
        /**
         * ScheduleDTO
         * @description A tarefa diária no Agendador de Tarefas: se existe e em que horário roda.
         */
        ScheduleDTO: {
            /** Scheduled */
            scheduled: boolean;
            /** Time */
            time: string | null;
        };
        /** ScheduleInDTO */
        ScheduleInDTO: {
            /**
             * Time
             * Format: time
             */
            time: string;
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
         * Severity
         * @description A gravidade de uma pendência. Crítica pede ação com prazo; atenção deixa um
         *     número errado ou longe da meta; informativa melhora o app sem mudar número de
         *     hoje. O contador da sidebar soma só as duas primeiras.
         * @enum {string}
         */
        Severity: "critical" | "warning" | "info";
        /**
         * SubportfolioColor
         * @description A cor de fundo do ícone da subcarteira. O tom de cada tema mora nos tokens
         *     `--subportfolio-*` do front.
         * @enum {string}
         */
        SubportfolioColor: "green" | "purple" | "slate-blue" | "pink" | "gold" | "graphite" | "teal" | "wine" | "terracotta" | "olive" | "indigo" | "brown";
        /**
         * SubportfolioDTO
         * @description A subcarteira com os ativos e os títulos de hoje, em ordem de nome.
         */
        SubportfolioDTO: {
            /** Id */
            id: number;
            /** Name */
            name: string;
            icon: components["schemas"]["SubportfolioIcon"];
            color: components["schemas"]["SubportfolioColor"];
            /** Assets */
            assets: components["schemas"]["MemberAssetDTO"][];
            /** Fixed Income */
            fixed_income: components["schemas"]["MemberInvestmentDTO"][];
        };
        /**
         * SubportfolioIcon
         * @description O ícone que identifica a subcarteira na sidebar e nos cards. Cada valor é o
         *     nome de um ícone do Lucide.
         * @enum {string}
         */
        SubportfolioIcon: "banknote" | "sprout" | "shield" | "globe" | "house" | "graduation-cap" | "plane" | "heart" | "car" | "baby" | "gift" | "umbrella" | "target" | "rocket" | "piggy-bank" | "briefcase" | "trending-up" | "mountain" | "star" | "hourglass" | "zap" | "leaf" | "anchor" | "trophy";
        /**
         * SubportfolioInDTO
         * @description O nome, o ícone e a cor: a identidade que aparece na sidebar e nos cards.
         */
        SubportfolioInDTO: {
            /** Name */
            name: string;
            icon: components["schemas"]["SubportfolioIcon"];
            color: components["schemas"]["SubportfolioColor"];
        };
        /**
         * SubtotalDTO
         * @description A soma de um grupo de itens. `cost` é o custo da renda variável e o
         *     principal da renda fixa. A variação do dia é nula quando nenhum item do grupo
         *     tem uma.
         */
        SubtotalDTO: {
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
        /** SuggestionDTO */
        SuggestionDTO: {
            /** Source Sector */
            source_sector: string | null;
            /** Source Industry */
            source_industry: string | null;
            /** Segment Id */
            segment_id: number | null;
            /** Sector Id */
            sector_id: number | null;
            /** New Sector Name */
            new_sector_name: string | null;
            /** New Segment Name */
            new_segment_name: string | null;
        };
        /**
         * TargetsDTO
         * @description As metas e os limites de uma subcarteira, em percentual e pontos percentuais,
         *     como o formulário os edita. Todo membro vem, com meta 0 quando não tem.
         */
        TargetsDTO: {
            /** Assets */
            assets: components["schemas"]["AssetTargetDTO"][];
            /**
             * Fixed Income Target
             * Format: decimal
             */
            fixed_income_target: DecimalString;
            /**
             * Max Item Deviation
             * Format: decimal
             */
            max_item_deviation: DecimalString;
            /**
             * Max Total Deviation
             * Format: decimal
             */
            max_total_deviation: DecimalString;
        };
        /**
         * TargetsInDTO
         * @description As metas somam 100; os limites vão em pontos percentuais.
         */
        TargetsInDTO: {
            /** Assets */
            assets: components["schemas"]["AssetTargetInDTO"][];
            /**
             * Fixed Income Target
             * Format: decimal
             */
            fixed_income_target: DecimalString;
            /**
             * Max Item Deviation
             * Format: decimal
             */
            max_item_deviation: DecimalString;
            /**
             * Max Total Deviation
             * Format: decimal
             */
            max_total_deviation: DecimalString;
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
        /** TickerMatchDTO */
        TickerMatchDTO: {
            /** Ticker */
            ticker: string;
            /** Name */
            name: string;
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
    search_api_market_tickers_get: {
        parameters: {
            query: {
                q: string;
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
                    "application/json": components["schemas"]["TickerMatchDTO"][];
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
                subportfolio_id?: number | null;
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
                subportfolio_id?: number | null;
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
                subportfolio_id?: number | null;
                category?: components["schemas"]["PortfolioCategory"] | null;
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
    suggestion_api_classification_suggestion_get: {
        parameters: {
            query: {
                ticker: string;
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
                    "application/json": components["schemas"]["SuggestionDTO"] | null;
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
    list_pending_api_classification_pending_get: {
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
                    "application/json": components["schemas"]["PendingDTO"];
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
    accept_all_api_classification_accept_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AcceptInDTO"];
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
    list_all_api_subportfolios_get: {
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
                    "application/json": components["schemas"]["SubportfolioDTO"][];
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
    create_api_subportfolios_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SubportfolioInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubportfolioDTO"];
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
    get_division_api_subportfolios_division_get: {
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
                    "application/json": components["schemas"]["DivisionDTO"];
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
    update_api_subportfolios__subportfolio_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subportfolio_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SubportfolioInDTO"];
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
    delete_api_subportfolios__subportfolio_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subportfolio_id: number;
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
    update_members_api_subportfolios__subportfolio_id__members_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subportfolio_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MembersInDTO"];
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
    get_portfolio_api_portfolio_get: {
        parameters: {
            query?: {
                subportfolio_id?: number | null;
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
    get_rebalance_api_rebalance_get: {
        parameters: {
            query?: {
                subportfolio_id?: number | null;
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
                    "application/json": components["schemas"]["RebalanceDTO"];
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
    get_plan_api_rebalance_plan_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlanInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlanDTO"];
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
    read_targets_api_rebalance__subportfolio_id__targets_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subportfolio_id: number;
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
                    "application/json": components["schemas"]["TargetsDTO"];
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
    write_targets_api_rebalance__subportfolio_id__targets_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subportfolio_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TargetsInDTO"];
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
    get_schedule_api_alert_schedule_get: {
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
                    "application/json": components["schemas"]["ScheduleDTO"];
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
    put_schedule_api_alert_schedule_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScheduleInDTO"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScheduleDTO"];
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
    delete_schedule_api_alert_schedule_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
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
    run_api_alert_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
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
    get_performance_api_performance_get: {
        parameters: {
            query?: {
                category?: components["schemas"]["PortfolioCategory"] | null;
                asset_id?: number | null;
                subportfolio_id?: number | null;
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
                subportfolio_id?: number | null;
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
                subportfolio_id?: number | null;
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
    get_risk_return_api_risk_return_get: {
        parameters: {
            query?: {
                category?: components["schemas"]["PortfolioCategory"] | null;
                subportfolio_id?: number | null;
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
                    "application/json": components["schemas"]["RiskReturnDTO"];
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
    summary_api_fixed_income_summary_get: {
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
                    "application/json": components["schemas"]["FixedIncomeSummaryDTO"];
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
    get_api_cash_get: {
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
                    "application/json": components["schemas"]["CashDTO"];
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
    create_check_api_cash_checks_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CashCheckInDTO"];
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
    remove_check_api_cash_checks__check_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                check_id: number;
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
    create_withdrawal_api_cash_withdrawals_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CashWithdrawalInDTO"];
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
    remove_withdrawal_api_cash_withdrawals__withdrawal_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                withdrawal_id: number;
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
    put_settings_api_cash_settings_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CashSettingsInDTO"];
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
    pair_api_correlation_pair_get: {
        parameters: {
            query: {
                first: string;
                second: string;
                window: components["schemas"]["CorrelationWindow"];
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
                    "application/json": components["schemas"]["CorrelationDTO"];
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
    correlation_matrix_api_correlation_matrix_get: {
        parameters: {
            query: {
                symbols: string[];
                window: components["schemas"]["CorrelationWindow"];
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
                    "application/json": components["schemas"]["CorrelationMatrixDTO"];
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
    portfolio_correlation_api_correlation_portfolio_get: {
        parameters: {
            query?: {
                window?: components["schemas"]["CorrelationWindow"];
                category?: components["schemas"]["PortfolioCategory"] | null;
                subportfolio_id?: number | null;
                benchmarks?: string[] | null;
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
                    "application/json": components["schemas"]["PortfolioCorrelationDTO"];
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
