"use client";

import { useState, useEffect } from "react";

// Reine Funktion für die Filterung der Autos
function filterCars(cars, searchTerm) {
    return cars.filter(car =>
        car.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// Funktion zum Hinzufügen eines neuen Autos (Unveränderliche Daten)
function addCar(newCar, cars) {
    return [...cars, newCar];
}

// Funktion zum Laden von Autos (mit Seiteneffekt)
async function loadCars(setCars, setError) {
    try {
        const response = await fetch("http://localhost:8080/cars");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCars(data);
    } catch (error) {
        setError(error.message);
    }
}

// Funktion zum Löschen eines Autos
async function deleteCar(id, setCars, setError) {
    try {
        const response = await fetch(`http://localhost:8080/cars/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        setCars(prevCars => prevCars.filter(car => car.id !== id));
    } catch (error) {
        setError(error.message);
    }
}

// Funktion für die Sortierung basierend auf Benutzerwahl
function dynamicSortCars(cars, sortAttribute, sortOrder) {
    return [...cars].sort((a, b) => {
        if (sortOrder === "asc") {
            return a[sortAttribute] > b[sortAttribute] ? 1 : -1;
        } else {
            return a[sortAttribute] < b[sortAttribute] ? 1 : -1;
        }
    });
}

export default function Home() {
    const [cars, setCars] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // Sortierattribute und -reihenfolge aus dem Zustand verwalten
    const [sortAttribute, setSortAttribute] = useState("horsePower");
    const [sortOrder, setSortOrder] = useState("asc");

    // Zustand für neues Auto
    const [newCar, setNewCar] = useState({ brand: "", model: "", horsePower: "" });

    // Gefilterte Autos
    const filteredCars = filterCars(cars, searchTerm);

    // Dynamisch sortierte Autos basierend auf Auswahl
    const sortedCars = dynamicSortCars(filteredCars, sortAttribute, sortOrder);

    useEffect(() => {
        loadCars(setCars, setError);
    }, []);

    const handleAddCar = (e) => {
        e.preventDefault();
        if (!newCar.brand || !newCar.model || !newCar.horsePower) {
            alert("Please fill out all fields.");
            return;
        }
        const updatedCars = addCar(newCar, cars);
        setCars(updatedCars);
        setNewCar({ brand: "", model: "", horsePower: "" });
    };

    const handleDeleteCar = (id) => {
        deleteCar(id, setCars, setError);
    };

    return (
        <div className="App">
            <h1>Car Management</h1>

            {error && <p className="error">Error: {error}</p>}

            <button onClick={() => loadCars(setCars, setError)}>Load Cars</button>

            <input
                type="text"
                placeholder="Search by brand"
                onChange={e => setSearchTerm(e.target.value)}
            />

            <div className="sort-options">
                <h3>Sort by:</h3>
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
                    Model
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

                <h3>Order:</h3>
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
                {sortedCars.length > 0 ? (
                    sortedCars.map(car => (
                        <li key={car.id}>
                            {car.brand} {car.model} ({car.horsePower} HP)
                            <button onClick={() => handleDeleteCar(car.id)}>Delete</button>
                        </li>
                    ))
                ) : (
                    <p className="no-data">No cars found</p>
                )}
            </ul>

            <form onSubmit={handleAddCar}>
                <h3>Add a New Car</h3>
                <input
                    type="text"
                    placeholder="Brand"
                    value={newCar.brand}
                    onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Model"
                    value={newCar.model}
                    onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="HorsePower"
                    value={newCar.horsePower}
                    onChange={(e) => setNewCar({ ...newCar, horsePower: e.target.value })}
                />
                <button type="submit">Add Car</button>
            </form>
        </div>
    );
}
