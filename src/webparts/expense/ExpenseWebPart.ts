import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'ExpenseWebPartStrings';
import Expense from './components/Expense';
import { IExpenseProps } from './components/IExpenseProps';
import { DEFAULT_API_BASE_URL } from '../../utils/Constants';

export interface IExpenseWebPartProps {
  apiBaseUrl: string;
}

export default class ExpenseWebPart extends BaseClientSideWebPart<IExpenseWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IExpenseProps> = React.createElement(
      Expense,
      {
        context: this.context,
        apiBaseUrl: this.properties.apiBaseUrl || DEFAULT_API_BASE_URL
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
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
