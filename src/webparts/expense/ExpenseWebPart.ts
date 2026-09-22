import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'ExpenseWebPartStrings';
import Expense from './components/Expense';
import { IExpenseProps } from './components/IExpenseProps';
import { DEFAULT_API_BASE_URL, DEFAULT_API_RESOURCE_ID } from '../../utils/Constants';
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from './components/common/PageSizeContext';

export interface IExpenseWebPartProps {
  apiBaseUrl: string;
  apiResourceId: string;
  defaultPageSize: number;
}

export default class ExpenseWebPart extends BaseClientSideWebPart<IExpenseWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IExpenseProps> = React.createElement(
      Expense,
      {
        context: this.context,
        apiBaseUrl: this.properties.apiBaseUrl || DEFAULT_API_BASE_URL,
        apiResourceId: this.properties.apiResourceId || DEFAULT_API_RESOURCE_ID,
        defaultPageSize: this.properties.defaultPageSize || DEFAULT_PAGE_SIZE
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('apiBaseUrl', {
                  label: strings.ApiBaseUrlFieldLabel
                }),
                PropertyPaneTextField('apiResourceId', {
                  label: strings.ApiResourceIdFieldLabel
                }),
                PropertyPaneDropdown('defaultPageSize', {
                  label: strings.DefaultPageSizeFieldLabel,
                  options: PAGE_SIZE_OPTIONS.map((size) => ({ key: size, text: String(size) })),
                  selectedKey: this.properties.defaultPageSize || DEFAULT_PAGE_SIZE
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
