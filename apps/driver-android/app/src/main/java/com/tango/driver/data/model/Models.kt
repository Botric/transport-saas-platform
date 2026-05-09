package com.tango.driver.data.model

data class ActivationResponse(
    val activationToken: String,
    val organisationId: String,
    val allowedRegions: List<String>,
    val expiresAt: String
)

data class ActivationRequest(
    val code: String,
    val deviceId: String
)

data class DriverDetailsRequest(
    val activationToken: String,
    val driverName: String,
    val vehicleRegistration: String
)

data class Region(
    val id: String,
    val name: String
)

data class Route(
    val id: String,
    val routeCode: String,
    val routeName: String
)

data class Departure(
    val id: String,
    val departureTime: String
)

data class TrackingPoint(
    val sessionId: String,
    val lat: Double,
    val lon: Double,
    val speed: Double,
    val heading: Double,
    val accuracy: Double,
    val timestamp: String
)

data class CapacityUpdate(
    val sessionId: String,
    val capacityLevel: String
)

data class DriverSessionRequest(
    val routeId: String,
    val departureId: String,
    val driverName: String,
    val vehicleRegistration: String
)

data class DriverSession(
    val sessionId: String,
    val status: String
)
