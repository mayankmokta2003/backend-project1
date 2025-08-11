class ApiError extends Error {
    constructor(
        statusCode ,
        message = "there is a error",
        errors = [],
        statck = ""  
    ){
        super(message)
        this.statusCode = statusCode,
        this.data = data,
        this.success = false;
        this.message = message;
        this.errors = errors

        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this , this.contructor)
        }
    }
}

export {ApiError}