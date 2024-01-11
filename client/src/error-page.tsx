import { useRouteError, isRouteErrorResponse  } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  let errorMessage: string, errorCode: number | undefined;

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorMessage = error.data.message || error.statusText;
    errorCode = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = 'Unknown error';
  }

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div id="error-page" className="w-full h-screen flex flex-row justify-between">
      <div className="flex flex-col justify-center items-center h-full w-full md:w-1/2">
        <div>
          <p className='text-primary font-bold pl-2'>{errorCode} {errorMessage}</p>
          <h1 className="text-8xl">Oops!</h1>
          <p className="text-xl pl-2 pt-5 pb-8 font-light text-slate-500">Sorry, an unexpected error has occurred.</p>
          <button onClick={handleGoBack} className="ml-2 px-5 py-3 bg-primary rounded-sm text-white font-medium">Go back</button>
        </div>
      </div>
      <div className="bg-[url('./images/login-bg.jpg')] md:w-3/5 bg-cover bg-center hidden md:block">

      </div>
    </div>
  );
}