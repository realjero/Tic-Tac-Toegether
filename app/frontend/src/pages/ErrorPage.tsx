import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <div className="flex h-screen w-full items-center justify-center text-text">
                <div className="space-y-4 text-center">
                    <h1 className="text-3xl">Oops!</h1>
                    <p>Sorry, an unexpected error has occurred.</p>
                    <p>
                        <i>{error.statusText}</i>
                    </p>
                </div>
            </div>
        );
    }
}
