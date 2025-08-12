class ApiError extends Error {
    constructor(
        statusCode ,
        message = "there is a error",
        errors = [],
        stack = ""  
    ){
        super(message)
        this.statusCode = statusCode,
        this.data = data,
        this.success = false;
        this.message = message;
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this , this.contructor)
        }
    }
}

export {ApiError}