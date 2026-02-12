import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { CitySelector } from "../components/CitySelector";
import { useAuth } from "../contexts/AuthContext";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import type { CityOption } from "../types";
import 'bootstrap/dist/css/bootstrap.min.css';
import { WeatherForecast } from "../components/WeatherForecast";
import { websocketService } from "../services/websocket";
import type { Alert } from "../types";
import { Alert as AlertComponent } from "../components/Alert";

export function HomePage() {
    const [currentCity, setCurrentCity] = useState<CityOption | null>(null);
    const { user, logout } = useAuth();
    const [alert, setAlert] = useState<Alert>();

    // Fetch the current city from the API
    useEffect(() => {
        const fetchCurrentCity = async () => {
            try {
                const response = await apiService.getCurrentCity();
                setCurrentCity({ cityName: response.cityName, latitude: response.latitude, longitude: response.longitude } as CityOption);
            } catch (error) {
                console.error('Error fetching city:', error);
            }
        };

        fetchCurrentCity();
    }, []);

    // Connect to the websocket
    useEffect(() => {
        if (user) {
            websocketService.connect({ userId: user.id, name: user.name, email: user.email });
        }
    }, [user]);

    // Listen for messages containing alerts from the websocket
    useEffect(() => {
        const unsubscribe = websocketService.onMessage((event) => {
            // event.data is a string from the server
            type AlertPayload = {
                type: "alert";
                cityName: string;
                alertSeverity: string;
                alertMessage: string;
            };

            let data: AlertPayload;
            try {
                data = JSON.parse(event.data as string) as AlertPayload;
            } catch {
                console.warn("Non‑JSON WebSocket message:", event.data);
                return;
            }

            // Only handle alert messages
            if (data.type !== "alert") {
                return;
            }

            const alertData: Alert = {
                cityName: data.cityName,
                alertSeverity: data.alertSeverity,
                alertMessage: data.alertMessage,
            };
            setAlert(alertData);
            // Clear the alert after 10 seconds
            setTimeout(() => {
                setAlert(undefined);
            }, 10000);
        });

        return unsubscribe;
    }, []);

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand>Nura Space Challenge</Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Nav>
                            <NavDropdown title={user?.name} id="user-dropdown" align="end">
                                <NavDropdown.Item disabled>{user?.email}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="py-4">
                <CitySelector setCurrentCity={setCurrentCity} />
                <h2 className="mt-4">Current city: {currentCity?.cityName || 'No city selected'}</h2>
            </Container>

            <Container className="py-4">
                <WeatherForecast currentCity={currentCity} />
            </Container>

            {alert && (
                <Container className="py-4">
                    <AlertComponent alert={alert} />
                </Container>
            )}
        </>
    );
}