import { World, IWorldOptions, setWorldConstructor } from "@cucumber/cucumber";
import {
  APIRequestContext,
  APIResponse,
  Browser,
  BrowserContext,
  Page,
  request,
} from "@playwright/test";
import {
  ErrorResponse,
  LoginResponse,
  MfaChallengeResponse,
} from "../models/auth.model";

import { getApiConfig, getWebBaseUrl } from "../config/env";
import { DriverFactory } from "../web/driverFactory";
import { WebDataFactory } from "../web/webDataFactory";
import { AccountsOverviewPage } from "../../tests/web/pages/accountsOverviewPage";
import { LoginPage } from "../../tests/web/pages/loginPage";
import {
  RegistrationCredentials,
  RegistrationPage,
} from "../../tests/web/pages/registrationPage";
import AuthService from "@src/services/authService";
import AccountService from "@src/services/accountService";
import BankingPaymentService from "@src/services/paymentService";
import PayeeService from "@src/services/payeeService";
import DataFactoryService from "@src/services/dataFactoryService";
import ScheduledPaymentService from "@src/services/scheduledPaymentService";
import StatementService from "@src/services/statementService";
import CustomerService from "@src/services/customerService";

export class CustomWorld extends World {
  request!: APIRequestContext;

  response!: APIResponse;

  customerApi: any;

  requestContext!: APIRequestContext;

  authService!: AuthService;

  responseBody!: LoginResponse;

  apiResponseBody!: any;

  loginBody!: LoginResponse;

  accessToken!: string;

  refreshToken!: string;

  errorBody!: ErrorResponse;

  mfaBody!: MfaChallengeResponse;

  challengeId!: string;

  challengeToken!: string;

  newAccessToken!: string;

  customerService!: CustomerService;

  accountService!: AccountService;
  paymentService!: BankingPaymentService;
  payeeService!: PayeeService;
  dataFactoryService!: DataFactoryService;
  scheduledPaymentService!: ScheduledPaymentService;
  statementService!: StatementService;
  customerId!: string;
  accounts: Array<any> = [];
  selectedAccount!: any;
  transactions: Array<any> = [];
  filteredTransactions: Array<any> = [];
  filteredAmount!: number;
  pages: Array<Array<any>> = [];
  paymentId!: string;
  firstPaymentId!: string;
  idempotencyKey!: string;
  sourceBalanceBefore!: number;
  destinationBalanceBefore!: number;
  secondPaymentId!: string;
  repeatedPayment!: any;
  auditBody!: any;
  payeeBody!: any;
  payeePayload!: { name: string; bsb: string; accountNumber: string };
  seedBody!: any;
  artifactPath!: string;
  seedCleanupComplete = false;
  scheduledPaymentBody!: any;
  statementBody!: any;
  adminBody!: any;
  schemaSweepCompleted = false;

  webBrowser!: Browser;
  webContext!: BrowserContext;
  webPage!: Page;
  loginPage!: LoginPage;
  registrationPage!: RegistrationPage;
  accountsOverviewPage!: AccountsOverviewPage;
  webCredentials!: RegistrationCredentials;
  webDataFactory!: WebDataFactory;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async initialize(): Promise<void> {
    const config = getApiConfig();
    this.requestContext = await request.newContext({
      baseURL: config.baseUrl,
    });

    this.authService = new AuthService(this.requestContext);
    this.customerService = new CustomerService(this.requestContext);
    this.accountService = new AccountService(this.requestContext);
    this.paymentService = new BankingPaymentService(this.requestContext);
    this.payeeService = new PayeeService(this.requestContext);
    this.dataFactoryService = new DataFactoryService(this.requestContext);
    this.scheduledPaymentService = new ScheduledPaymentService(
      this.requestContext,
    );
    this.statementService = new StatementService(this.requestContext);
  }

  async dispose(): Promise<void> {
    if (this.requestContext) {
      await this.requestContext.dispose();
    }
  }

  async initializeWeb(): Promise<void> {
    this.webBrowser = await DriverFactory.createBrowser();
    this.webContext = await this.webBrowser.newContext({
      baseURL: getWebBaseUrl(),
    });
    this.webPage = await this.webContext.newPage();
    this.loginPage = new LoginPage(this.webPage);
    this.registrationPage = new RegistrationPage(this.webPage);
    this.accountsOverviewPage = new AccountsOverviewPage(this.webPage);
    this.webDataFactory = new WebDataFactory();
  }

  async disposeWeb(): Promise<void> {
    await this.webDataFactory?.dispose();
    await this.webContext?.close();
    await this.webBrowser?.close();
  }
}

setWorldConstructor(CustomWorld);
