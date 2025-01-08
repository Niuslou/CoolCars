"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// Filter Cars nach Marke
const filterCars = (cars, searchTerm) => {
    return cars.filter(car =>
        car.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Autos hinzufügen (Unveränderliche Daten)
const addCar = (newCar, cars) => {
    return [...cars, newCar];
};

// Autos laden (mit Seiteneffekt)
const loadCars = async (setCars, setError) => {
    try {
        const response = await fetch("http://localhost:8080/cars");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCars(data);
    } catch (error) {
        setError(error.message);
    }
};

// Dynamische Sortierung basierend auf Attribut und Reihenfolge
const dynamicSortCars = (cars, sortAttribute, sortOrder) => {
    return [...cars].sort((a, b) => {
        if (sortOrder === "asc") {
            return a[sortAttribute] > b[sortAttribute] ? 1 : -1;
        } else {
            return a[sortAttribute] < b[sortAttribute] ? 1 : -1;
        }
    });
};

// Löschen eines Autos
const deleteCar = async (id, setCars, cars, setError) => {
    try {
        const response = await fetch(`http://localhost:8080/cars/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Fehler: ${response.status} - ${response.statusText}`);

        // Auto aus der Liste entfernen
        const updatedCars = cars.filter(car => car.id !== id);
        setCars(updatedCars);  // Liste aktualisieren
    } catch (error) {
        setError(error.message);
    }
};

// Hinzufügen eines neuen Autos
const handleAddCar = async (newCar, setCars, cars, setError) => {
    try {
        const response = await fetch("http://localhost:8080/cars", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCar),
        });
        if (!response.ok) throw new Error(`Fehler: ${response.status} - ${response.statusText}`);

        const addedCar = await response.json();
        const updatedCars = addCar(addedCar, cars);
        setCars(updatedCars);  // Liste mit neuem Auto aktualisieren
    } catch (error) {
        setError(error.message);
    }
};

// Hauptkomponente
export default function Home() {
    const [cars, setCars] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [newCarData, setNewCarData] = useState({ brand: "", model: "", horsePower: "" });
    const [sortAttribute, setSortAttribute] = useState("horsePower");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);  // Aktuelle Seite
    const carsPerPage = 8;  // Anzahl der Autos pro Seite

    // Gefilterte Autos basierend auf der Suchanfrage
    const filteredCars = useMemo(() => filterCars(cars, searchTerm), [cars, searchTerm]);

    // Dynamisch sortierte Autos
    const sortedCars = useMemo(() => dynamicSortCars(filteredCars, sortAttribute, sortOrder), [filteredCars, sortAttribute, sortOrder]);

    // Berechnung der Autos für die aktuelle Seite
    const paginatedCars = useMemo(() => {
        const indexOfLastCar = currentPage * carsPerPage;
        const indexOfFirstCar = indexOfLastCar - carsPerPage;
        return sortedCars.slice(indexOfFirstCar, indexOfLastCar);
    }, [sortedCars, currentPage]);

    // Gesamtzahl der Seiten
    const totalPages = Math.ceil(sortedCars.length / carsPerPage);

    // Lade Autos beim ersten Rendern
    useEffect(() => {
        loadCars(setCars, setError);
    }, []);

    // Eingabeveränderung im Formular
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCarData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Validierung der Formularfelder
    const validateForm = () => {
        const { brand, model, horsePower } = newCarData;
        if (!brand || !model || !horsePower) {
            return "Alle Felder müssen ausgefüllt werden!";
        }
        if (isNaN(horsePower) || horsePower <= 0) {
            return "PS muss eine gültige Zahl sein!";
        }
        return null;
    };

    // Formular absenden
    const handleSubmit = (e) => {
        e.preventDefault();
        const formError = validateForm();
        if (formError) {
            setError(formError);
        } else {
            handleAddCar(newCarData, setCars, cars, setError);
            setNewCarData({ brand: "", model: "", horsePower: "" });  // Formular zurücksetzen
        }
    };

    return (
        <div className="App">
            <h1>Car Management</h1>



            <button onClick={() => loadCars(setCars, setError)}>Autos laden</button>

            <input
                type="text"
                placeholder="Nach Marke suchen"
                onChange={e => setSearchTerm(e.target.value)}
            />

            <div className="sort-options">
                <h3>Sortieren nach:</h3>
                <label>
                    <input
                        type="radio"
                        name="sortAttribute"
                        value="brand"
                        checked={sortAttribute === "brand"}
                        onChange={(e) => setSortAttribute(e.target.value)}
                    />
                    Marke
                </label>
                <label>
                    <input
                        type="radio"
                        name="sortAttribute"
                        value="model"
                        checked={sortAttribute === "model"}
                        onChange={(e) => setSortAttribute(e.target.value)}
                    />
                    Modell
                </label>
                <label>
                    <input
                        type="radio"
                        name="sortAttribute"
                        value="horsePower"
                        checked={sortAttribute === "horsePower"}
                        onChange={(e) => setSortAttribute(e.target.value)}
                    />
                    PS
                </label>

                <h3>Reihenfolge:</h3>
                <label>
                    <input
                        type="radio"
                        name="sortOrder"
                        value="asc"
                        checked={sortOrder === "asc"}
                        onChange={(e) => setSortOrder(e.target.value)}
                    />
                    Aufsteigend
                </label>
                <label>
                    <input
                        type="radio"
                        name="sortOrder"
                        value="desc"
                        checked={sortOrder === "desc"}
                        onChange={(e) => setSortOrder(e.target.value)}
                    />
                    Absteigend
                </label>
            </div>

            <ul>
                {paginatedCars.length > 0 ? (
                    paginatedCars.map(car => (
                        <li key={car.id}>
                            {car.brand} {car.model} ({car.horsePower} PS)
                            <button onClick={() => deleteCar(car.id, setCars, cars, setError)}>
                                löschen
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="no-data">No cars found</p>
                )}
            </ul>

            {/* Paginierung */}
            <div className="pagination">
                <button
                    onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))}
                    disabled={currentPage === 1}
                >
                    vorherige Seite
                </button>
                <span>Seite {currentPage} von {totalPages}</span>
                <button
                    onClick={() => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    nächste Seite
                </button>
            </div>

            <h2>Neues Auto hinzufügen</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="brand"
                    value={newCarData.brand}
                    onChange={handleInputChange}
                    placeholder="Marke"
                />
                <input
                    type="text"
                    name="model"
                    value={newCarData.model}
                    onChange={handleInputChange}
                    placeholder="Modell"
                />
                <input
                    type="number"
                    name="horsePower"
                    value={newCarData.horsePower}
                    onChange={handleInputChange}
                    placeholder="PS"
                />
                <button type="submit">Auto hinzufügen</button>
            </form>
        </div>
    );
}
