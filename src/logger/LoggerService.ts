import winston from "winston"


class LoggerService{
    private static myLogger = winston.createLogger({
        format: winston.format.json(),
        transports: [
            new winston.transports.File({filename: process.cwd() +'/project.logs'}),
        ],
    
    })
    static writeErrorLog(msg:string) {
        this.myLogger.error({
            timeStamp: new Date().toLocaleString(),
            message: msg,
        })
    }
    static writeInfoLog(msg:string) {
        this.myLogger.info({
            timeStamp: new Date().toLocaleString(),
            message: msg,
        })
    }

    
}
export default LoggerService