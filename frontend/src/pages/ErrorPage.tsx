import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  
  let errorMessage: string;
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error';
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, an unexpected error has occurred.
        </p>
        <p className="text-gray-500">
          <i>{errorMessage}</i>
        </p>
      </div>
    </div>
  );
};

export default ErrorPage; 