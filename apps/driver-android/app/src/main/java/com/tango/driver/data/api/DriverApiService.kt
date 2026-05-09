package com.tango.driver.data.api

import com.tango.driver.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface DriverApiService {

    @POST("driver-app/activate")
    suspend fun activate(@Body request: ActivationRequest): Response<ActivationResponse>

    @GET("driver-app/vehicles")
    suspend fun getVehicles(@Header("Authorization") token: String): Response<List<Map<String, String>>>

    @POST("driver-app/driver-details")
    suspend fun submitDriverDetails(@Body request: DriverDetailsRequest): Response<Unit>

    @GET("driver-app/regions")
    suspend fun getRegions(@Header("Authorization") token: String): Response<List<Region>>

    @GET("driver-app/regions/{regionId}/routes")
    suspend fun getRoutes(
        @Header("Authorization") token: String,
        @Path("regionId") regionId: String
    ): Response<List<Route>>

    @GET("driver-app/routes/{routeId}/departures")
    suspend fun getDepartures(
        @Header("Authorization") token: String,
        @Path("routeId") routeId: String,
        @Query("window") window: String = "next-hour"
    ): Response<List<Departure>>

    @POST("driver-sessions")
    suspend fun createSession(@Body request: DriverSessionRequest): Response<DriverSession>

    @POST("tracking/points")
    suspend fun sendTrackingPoint(@Body point: TrackingPoint): Response<Unit>

    @POST("capacity/update")
    suspend fun sendCapacityUpdate(@Body update: CapacityUpdate): Response<Unit>

    @POST("driver-sessions/{sessionId}/end")
    suspend fun endSession(@Path("sessionId") sessionId: String): Response<Unit>
}
