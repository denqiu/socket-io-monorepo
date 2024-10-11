import RuntimeUtil from "@dqiu/util-runtime";

const ServerUtil = {
    backendPort: RuntimeUtil.nodeProcess?.env?.PORT || 4000,
    NODE_ENV: RuntimeUtil.nodeProcess?.env?.NODE_ENV || 'development',
};

export default ServerUtil;