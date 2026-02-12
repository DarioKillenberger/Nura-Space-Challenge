import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { CitySelector } from "../components/CitySelector";
import { useAuth } from "../contexts/AuthContext";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import type { CityOption } from "../types";
import 'bootstrap/dist/css/bootstrap.min.css';
import { WeatherForecast } from "../components/WeatherForecast";

export function HomePage() {
    const [currentCity, setCurrentCity] = useState<CityOption | null>(null);
    const { user, logout } = useAuth();

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
        </>
    );
}