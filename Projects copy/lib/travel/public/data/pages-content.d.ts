export declare const pagesContent: {
    flights: {
        title: string;
        totalTime: string;
        departure: {
            city: string;
            airport: string;
            time: string;
        };
        arrival: {
            city: string;
            airport: string;
            time: string;
        };
        travelInfo: {
            airline: string;
            class: string;
            plane: string;
            flightNo: string;
        };
        attribution: {
            model: {
                name: string;
                link: string;
            };
            license: {
                name: string;
                link: string;
            };
            author: string;
        }[];
    };
    taxis: {
        title: string;
        totalTime: string;
        departure: {
            city: string;
            address: string;
        };
        arrival: {
            city: string;
            address: string;
        };
        travelInfo: {
            time: string;
            cost: string;
            vehicle: string;
            person: string;
        };
        attribution: {
            model: {
                name: string;
                link: string;
            };
            license: {
                name: string;
                link: string;
            };
            author: string;
        }[];
    };
    hotels: {
        title: string;
        dates: {
            checkIn: string;
            checkOut: string;
        };
        accomodationType: string;
    };
};
