/**
 * Type declarations for socket.io module
 */

declare module 'socket.io' {
  import { Server as HttpServer } from 'http';
  
  export interface ServerOptions {
    path?: string;
    serveClient?: boolean;
    adapter?: any;
    cors?: {
      origin?: string | string[];
      methods?: string[];
      allowedHeaders?: string[];
      credentials?: boolean;
    };
    allowEIO3?: boolean;
    pingTimeout?: number;
    pingInterval?: number;
    upgradeTimeout?: number;
    maxHttpBufferSize?: number;
    transports?: string[];
    allowUpgrades?: boolean;
    perMessageDeflate?: boolean | { threshold: number };
    httpCompression?: boolean | { threshold: number };
    wsEngine?: string;
    parser?: any;
  }
  
  export interface SocketOptions {
    forceNew?: boolean;
    multiplex?: boolean;
    transports?: string[];
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    randomizationFactor?: number;
    timeout?: number;
    autoConnect?: boolean;
    query?: Record<string, any>;
    parser?: any;
    upgrade?: boolean;
    forceJSONP?: boolean;
    jsonp?: boolean;
    forceBase64?: boolean;
    enablesXDR?: boolean;
    timestampRequests?: boolean;
    timestampParam?: string;
    policyPort?: number;
    path?: string;
    rememberUpgrade?: boolean;
    agent?: boolean;
    pfx?: any;
    key?: any;
    passphrase?: string;
    cert?: any;
    ca?: any[];
    ciphers?: string;
    rejectUnauthorized?: boolean;
  }
  
  export interface Socket {
    id: string;
    rooms: Set<string>;
    connected: boolean;
    disconnected: boolean;
    handshake: {
      headers: Record<string, string>;
      time: string;
      address: string;
      xdomain: boolean;
      secure: boolean;
      issued: number;
      url: string;
      query: Record<string, string>;
    };
    join(room: string | string[]): void;
    leave(room: string): void;
    to(room: string): Socket;
    in(room: string): Socket;
    compress(compress: boolean): Socket;
    disconnect(close?: boolean): Socket;
    emit(event: string, ...args: any[]): boolean;
    on(event: string, callback: (...args: any[]) => void): Socket;
    once(event: string, callback: (...args: any[]) => void): Socket;
    off(event: string, callback?: (...args: any[]) => void): Socket;
  }
  
  export interface Namespace {
    name: string;
    connected: { [id: string]: Socket };
    adapter: any;
    to(room: string): Namespace;
    in(room: string): Namespace;
    emit(event: string, ...args: any[]): boolean;
    clients(callback: (error: Error | null, clients: string[]) => void): Namespace;
    use(fn: (socket: Socket, next: (err?: any) => void) => void): Namespace;
  }
  
  export class Server {
    constructor(srv?: HttpServer, opts?: ServerOptions);
    constructor(opts?: ServerOptions);
    
    engine: any;
    httpServer: HttpServer;
    
    listen(port: number, callback?: () => void): Server;
    listen(port: number, options?: ServerOptions, callback?: () => void): Server;
    listen(srv: HttpServer, callback?: () => void): Server;
    listen(srv: HttpServer, options?: ServerOptions, callback?: () => void): Server;
    
    attach(srv: HttpServer, options?: ServerOptions): Server;
    
    bind(srv: HttpServer): Server;
    
    onconnection(socket: any): Server;
    
    of(nsp: string): Namespace;
    
    close(callback?: () => void): Server;
    
    on(event: string, callback: (...args: any[]) => void): Server;
    
    to(room: string): Namespace;
    in(room: string): Namespace;
    
    use(fn: (socket: Socket, next: (err?: any) => void) => void): Server;
    
    emit(event: string, ...args: any[]): Server;
    
    send(...args: any[]): Server;
    write(...args: any[]): Server;
    
    allSockets(): Promise<Set<string>>;
    
    compress(compress: boolean): Server;
    
    path(): string;
    path(v: string): Server;
    
    adapter(): any;
    adapter(v: any): Server;
    
    origins(): string;
    origins(v: string): Server;
    
    serveClient(): boolean;
    serveClient(v: boolean): Server;
  }
  
  export default Server;
}