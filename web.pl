:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_error)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_cors)).
:- use_module(library(http/http_files)).
:- set_setting_default(http:cors, [*]).

server(Port) :-
    http_server(http_dispatch, [port(Port)]).

% Cargar base de conocimiento
:- consult('plantas.pl').

:- http_handler(root(.), http_reply_from_files('.', []), [prefix]).

% Manejador de recomendaciones
:- http_handler('/recomendar', recomendar_planta_handler, [methods([post])]).

recomendar_planta_handler(Request) :-
    cors_enable(Request, [methods([post])]),
    catch(
        http_read_json_dict(Request, DictIn),
        _,
        http_400(Request, 'Invalid JSON')
    ),
    atom_string(Luz, DictIn.luz),
    (DictIn.humedad = "si" -> Humedad = si ; Humedad = no),
    (DictIn.cuidado = "si" -> Facil = si ; Facil = no),
    atom_string(Espacio, DictIn.espacio),
    (DictIn.mascota = "si" -> Mascota = si ; Mascota = no),

    findall(Planta,
        (
            planta(Planta),
            luz(Planta, Luz),
            humedad(Planta, Humedad),
            facilCuidado(Planta, Facil),
            espacioDisponible(Planta, Espacio),
            seguraParaMascotas(Planta, Mascota)
        ),
        Plantas
    ),
    (   Plantas \= [] 
    ->  reply_json_dict(_{plantas: Plantas})
    ;   reply_json_dict(_{error: "No se encontraron plantas"}, [status(404)])
    ).



% Manejador de características
:- http_handler('/caracteristicas', caracteristicas_handler, [methods([post])]).

caracteristicas_handler(Request) :-
    cors_enable(Request, [methods([post])]),
    http_read_json_dict(Request, DictIn),
    atom_string(Planta, DictIn.planta),
    findall(
        _{ 
            nombreCientifico: Cientifico,
            cantidadDeRiego: Riego,
            frecuenciaDeriego: FrecRiego,
            espacioDisponible: Espacio,
            facilCuidado: Facilidad,
            seguraParaMascotas: Mascotas,
            luz: Luz,
            humedad: Humedad,
            temperatura: Temp,
            tipoFertilizante: Fertilizante,
            frecuenciaFertilizacion: FrecFert,
            cantidadFertilizante: CantFert
        },
        (
            nombreCientifico(Planta, Cientifico),
            cantidadDeRiego(Planta, Riego),
            frecuenciaDeriego(Planta, FrecRiego),
            espacioDisponible(Planta, Espacio),
            facilCuidado(Planta, Facilidad),
            seguraParaMascotas(Planta, Mascotas),
            luz(Planta, Luz),
            humedad(Planta, Humedad),
            temperatura(Planta, Temp),
            tipoFertilizante(Planta, Fertilizante),
            frecuenciaFertilizacion(Planta, FrecFert),
            cantidadFertilizante(Planta, CantFert)
        ),
        ResultList
    ),
    ( ResultList = [Result] 
    -> reply_json_dict(Result)
    ;  reply_json_dict(_{error: "No se encontraron características"}, [status(404)])
    ).

% Ruta específica para servir el favicon desde /img/favicon.ico
:- http_handler('/favicon.ico', serve_favicon, []).

serve_favicon(Request) :-
    http_reply_file('img/favicon.ico', [], Request).

:- http_handler('/script.js', http_reply_file('script.js', [mimetype('text/javascript')]), []).

:- initialization(server(8080)).