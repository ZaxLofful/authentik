import { t } from "@lingui/macro";

import { CSSResult, TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import PFFlex from "@patternfly/patternfly/layouts/Flex/flex.css";

import { ExpiringBaseGrantModel, Oauth2Api, RefreshTokenModel } from "@goauthentik/api";

import { AKResponse } from "../../api/Client";
import { DEFAULT_CONFIG } from "../../api/Config";
import { uiConfig } from "../../common/config";
import { PFColor } from "../Label";
import "../forms/DeleteBulkForm";
import { Table, TableColumn } from "../table/Table";

@customElement("ak-user-oauth-refresh-list")
export class UserOAuthRefreshList extends Table<RefreshTokenModel> {
    expandable = true;

    @property({ type: Number })
    userId?: number;

    static get styles(): CSSResult[] {
        return super.styles.concat(PFFlex);
    }

    async apiEndpoint(page: number): Promise<AKResponse<RefreshTokenModel>> {
        return new Oauth2Api(DEFAULT_CONFIG).oauth2RefreshTokensList({
            user: this.userId,
            ordering: "expires",
            page: page,
            pageSize: (await uiConfig()).pagination.perPage,
        });
    }

    checkbox = true;
    order = "-expires";

    columns(): TableColumn[] {
        return [
            new TableColumn(t`Provider`, "provider"),
            new TableColumn(t`Revoked?`, "revoked"),
            new TableColumn(t`Expires`, "expires"),
            new TableColumn(t`Scopes`, "scope"),
        ];
    }

    renderExpanded(item: RefreshTokenModel): TemplateResult {
        return html` <td role="cell" colspan="4">
                <div class="pf-c-table__expandable-row-content">
                    <div class="pf-l-flex">
                        <div class="pf-l-flex__item">
                            <h3>${t`ID Token`}</h3>
                            <pre>${item.idToken}</pre>
                        </div>
                    </div>
                </div>
            </td>
            <td></td>
            <td></td>`;
    }

    renderToolbarSelected(): TemplateResult {
        const disabled = this.selectedElements.length < 1;
        return html`<ak-forms-delete-bulk
            objectLabel=${t`Refresh Code(s)`}
            .objects=${this.selectedElements}
            .usedBy=${(item: ExpiringBaseGrantModel) => {
                return new Oauth2Api(DEFAULT_CONFIG).oauth2RefreshTokensUsedByList({
                    id: item.pk,
                });
            }}
            .delete=${(item: ExpiringBaseGrantModel) => {
                return new Oauth2Api(DEFAULT_CONFIG).oauth2RefreshTokensDestroy({
                    id: item.pk,
                });
            }}
        >
            <button ?disabled=${disabled} slot="trigger" class="pf-c-button pf-m-danger">
                ${t`Delete`}
            </button>
        </ak-forms-delete-bulk>`;
    }

    row(item: RefreshTokenModel): TemplateResult[] {
        return [
            html`<a href="#/core/providers/${item.provider?.pk}"> ${item.provider?.name} </a>`,
            html`<ak-label color=${item.revoked ? PFColor.Orange : PFColor.Green}>
                ${item.revoked ? t`Yes` : t`No`}
            </ak-label>`,
            html`${item.expires?.toLocaleString()}`,
            html`${item.scope.join(", ")}`,
        ];
    }
}
