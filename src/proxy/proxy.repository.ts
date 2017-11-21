import { ProxyConfig } from './models/proxy-config';

export class ProxyRepository {
    private static proxyConfigsStore: WeakMap<any, ProxyConfig> = new WeakMap();

    static getOrCreateProxyConfig(targetClass: any): ProxyConfig {
        let proxyConfig = ProxyRepository.proxyConfigsStore.get(targetClass);
        if (!proxyConfig) {
            proxyConfig = new ProxyConfig();
            ProxyRepository.proxyConfigsStore.set(targetClass, proxyConfig);
        }
        return proxyConfig;
    }
}
