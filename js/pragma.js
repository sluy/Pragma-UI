/**
 * Pragma UI. 
 * Framework para el diseño rápido de Frontends.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	//Versión del plugin
	Pragma.Ver = "1.0.0";
	//Librerías
	Pragma.Libs = {}
	//Utilidades
	Pragma.Utils = {
		/**
		 * Devuelve la cantidad de objetos dentro de la variable suministrada.
		 * @param  {object} obj Variable a contar.
		 */
		count_object: function (obj)
		{
			var count = 0;
			for (var prop in obj)
			{
				if (obj.hasOwnProperty(prop))
					++count;
			}
			return count;
		},
		/**
		 * Codifica los caracteres especiales HTML de la cadena suministrada.
		 * @param  {string} str Caracteres a codificar.
		 * @return {string}
		 */
		encode_html: function (str)
		{
			return $('<div/>').text(str).html();
		},
		/**
		 * Decodifica los caracteres especiales HTML de la cadena suministrada.
		 * @param  {string} str Cadena a decodificar.
		 * @return {string}
		 */
		decode_html: function (str)
		{
			return $("<div/>").html(str).text();
		},
		/**
		 * Devuelve una cadena de caracteres alfanuméricos aleatoria.
		 * @param  {number} length Longitud de la cadena.
		 * @param  {string} chars  Caracteres a usar.
		 * @return {string}
		 */
		random_str: function (length, chars)
		{
			if (typeof chrs != "string")
				chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
			if (typeof length != "numeric" || length <= 0)
				length = 10;
			var result = '';
			for (var i = length; i > 0; --i)
				result += chars[Math.round(Math.random() * (chars.length - 1))];
			return result;
		},
		/**
		 * Determina si la cadena suministrada es un número decimal.
		 * @param  {number|string}  n Cadena a validar.
		 * @return {Boolean}
		 */
		is_float: function (n)
		{
			return n === +n && n !== (n | 0);
		},
		/**
		 * Determina si la cadena suministrada es un número entero.
		 * @param  {number|string}  n Cadena a validar.
		 * @return {Boolean}
		 */
		is_int: function (n)
		{
			return n === +n && n === (n | 0);
		},
		/**
		 * Devuelve el tipo de dispositivo desde el cual se está viendo el elemento dado.
		 * @param  {object} $el Elemento a analizar. Si no es suministrado tomará por defecto $(window)
		 * @return {boolean}
		 */
		get_device: function ($el)
		{
			if (typeof $el != "object") $el = $(window);
			var width = $el.width();
			if (width < 768)
				return "xs";
			if (width > 767 && width < 992)
				return "sm";
			if (width > 991 && width < 1200)
				return "md";
			if (width > 1199)
				return "lg";
		},
		/**
		 * Determina si el elemento está visto desde un dispositivo extra pequeño.
		 * @param  {object} $el Elemento a analizar. Si no es suministrado tomará por defecto $(window)
		 * @return {boolean}
		 */
		is_xs_device: function ($el)
		{
			if (typeof $el != "object") $el = $(window);
			return ($el.width < 768);
		},
		/**
		 * Determina si el elemento está visto desde un dispositivo pequeño.
		 * @param  {object} $el Elemento a analizar. Si no es suministrado tomará por defecto $(window)
		 * @return {boolean}
		 */
		is_sm_device: function ($el)
		{
			if (typeof $el != "object") $el = $(window);
			var width = $el.width();
			return (width > 767 && width < 992);
		},
		/**
		 * Determina si el elemento está visto desde un dispositivo mediano.
		 * @param  {object} $el Elemento a analizar. Si no es suministrado tomará por defecto $(window)
		 * @return {boolean}
		 */
		is_md_device: function ($el)
		{
			if (typeof $el != "object") $el = $(window);
			var width = $el.width();
			return (width > 991 && width < 1200);
		},
		/**
		 * Determina si el elemento está visto desde un dispositivo grande.
		 * @param  {object} $el Elemento a analizar. Si no es suministrado tomará por defecto $(window)
		 * @return {boolean}
		 */
		is_lg_device: function ($el)
		{
			if (typeof $el != "object") $el = $(window);
			return ($el.width() > 1199);
		},
		event_end: (function ()
		{
			var timers = {};
			return function (callback, ms, uniqueId)
			{
				if (!uniqueId)
				{
					uniqueId = "Don't call this twice without a uniqueId";
				}
				if (timers[uniqueId])
				{
					clearTimeout(timers[uniqueId]);
				}
				timers[uniqueId] = setTimeout(callback, ms);
			};
		})(),
		/**
		 * Manejador de efectos.
		 * Provee de los métodos :
		 * fx_manager.add(name,callback)        : Agrega un efecto al manager.El parámetro [name] será el nombre del 
		 *                                        efecto y [definition] la definición de la función del efecto.
		 * fx_manager.run(name,action,callback) : Ejecuta el efecto con nombre [name] suministrando como parámetros 
		 *                                        [action] que será la acción ejecutada (ejemplo "open") y el 
		 *                                        [callback] que será una función a ejecutar al terminar el efecto. 
		 */
		fx_manager: function ()
		{
			var self = this;
			self.effects = {};

			self.add = function (name, definition)
			{
				if (typeof name == "string" && typeof definition == "function")
				{
					self.effects[name.toLowerCase()] = definition;
				}
			};
			self.run = function (name, action, callback)
			{
				if (typeof name == "string" && typeof self.effects[name.toLowerCase()] == "function")
				{
					return self.effects[name.toLowerCase()](action, callback);
				} else
				{
					if (typeof callback == "function")
					{
						callback();
					}

				}
			}
		},
		/**
		 * Crea un reloj complejo con diversos métodos para el control del mismo y ejecución de procesos.
		 * timer.setLength(length)       : Determina el tiempo en milisegundos de espera antes de detener el timer.
		 * timer.addCallback(callback)   : Establece la función que ejecutará automáticamente al detener el timer.
		 * timer.addInterval(callback)   : Establece la función que ejecutará automáticamente cada vez que termine 
		 *                                 un intervalo de tiempo. El intervalo de tiempo por defecto se repite cada 
		 *                                 10 milisegundos y puede ser cambiado con la función setInterval().
		 * timer.setRepeat(value)        : Determina si el reloj debe ser reinicializado al terminar. Por defecto [false].
		 * timer.play()                  : Inicia manualmente el reloj. Si el mismo fue detenido con el método 
		 *                                 timer.pause() continuará con rrespecto a los milisegundos transcurridos al 
		 *                                 detenerse.
		 * timer.pause()                 : Pausa el reloj.
		 * timer.stop()                  : Detiene y reinicializa el tiempo transcurrido del reloj.
		 * timer.restart()               : Detiene, reinicializa el tiempo transcurrido y vuelve a iniciar el reloj.
		 *                                 
		 * 
		 * @param  {[type]} length Tiempo en milisegundos en el que se detendrá el reloj. Cuando se detiene ejecutará 
		 *                         las funciones suministradas con el método timer.addCallback().
		 */
		timer: function (length)
		{
			var self = this;

			self.ms = parseInt(length);
			self.remaining = self.ms;
			self.interval_length = 10;
			self.timer = false;
			self.callbacks = [];
			self.interval_callbacks = [];
			self.setIntervalLength = function(length){ self.interval_length = parseInt(length);}
			self.setLength = function (length) { self.ms = parseInt(length); }
			self.addCallback = function (callback) { if (typeof callback == "function") self.callbacks.push(callback) };
			self.addIntervalCallback = function (callback) { if (typeof callback == "function") self.interval_callbacks.push(callback) };
			self.setRepeat = function (value) { }
			self.pause = function ()
			{
				if (self.timer !== false)
					clearInterval(self.timer);
				self.timer = false;
			}
			self.play = function ()
			{
				if (self.timer !== false)
					return;

				self.timer = setInterval(function ()
				{
					self.remaining = (self.remaining - self.interval_length);
					var elapsed = self.ms - self.remaining;
					var percent = (elapsed * 100) / self.ms;

					for (var index = 0; index < self.interval_callbacks.length; ++index)
					{
						self.interval_callbacks[index](self.ms, elapsed, self.remaining, percent, self.interval_length);
					}

					if (self.remaining <= 0)
					{
						//terminó
						self.stop(true);
					}
				}, self.interval_length);
			};
			self.stop = function (execute_callbacks)
			{
				self.pause();
				self.remaining = self.ms;

				if (execute_callbacks === true)
				{
					self.remaining = self.ms;
					for (var index = 0; index < self.callbacks.length; ++index)
					{
						self.callbacks[index]();
					}
				}
			}

			self.restart = function ()
			{
				self.stop();
				self.play();
			}

		},
		/**
		* Devuelve el objetivo de un botón trigger de algún plugin.
		* @param  {[object]}          $element  Elemento activador
		* @param  {[string]}          property  Propiedad data a leer ([plugin]-[trigger]).Ejemplo : modal-open
		* @param  {[string]}          _next     Clase que deberá buscar en caso que no esté definido el objetivo en la propiedad
		* @return {[boolean][object]}           Objeto jquery con el elemento o FALSE.
		*/
		get_target: function ($element, property, _next, _closest, _nested)
		{
			property = "data-" + property;

			//Verifica si existe la propiedad data suministrada
			if ($element.attr(property) !== undefined)
			{
				//Si dicha propiedad almacena el identificador de un elemento existente en la página, devuelve el elemento
				if ($($element.attr(property)).length > 0)
					return $($element.attr(property));
			}

			//Busca el elemento siguiente
			if (_next)
			{
				if ($element.next(_next).length > 0)
					return $element.next(_next);
			}
			//Busca el elemento padre
			if (_closest)
			{
				if ($element.closest(_closest).length > 0)
				{
					return $element.closest(_closest);
				}
			}
			//Busca el elemento anidado
			if (_nested)
			{
				if ($element.find(" > " + _nested).length > 0)
				{
					return $element.find(" > " + _nested);
				}
			}
			return false;
		},

		get_instance_option: function (instance, name, action, prefix)
		{

			if (typeof name != "string")
			{
				name = "";
			}

			if (typeof action != "string")
			{
				action = "";
			} else
			{
				action = action + "_";
			}

			if (typeof prefix != "string")
			{
				prefix = "";
			} else
			{
				prefix = prefix + "_";
			}


			if (instance.options[prefix + action + name] !== undefined && instance.options[prefix + action + name] != "inherit")
			{
				return instance.options[prefix + action + name];
			}
			return instance.options[name];
		},

		data_options: function (el, dataname)
		{
			var opts = {}, ii, p, opts_arr;
			if (!dataname)
				dataname = "options";

			dataname = "data-" + dataname;

			var options = el.attr(dataname) || "";
			options = $.trim(options);

			opts_arr = (options || ':').split(';');
			ii = opts_arr.length;

			function isNumber(o)
			{
				return !isNaN(o - 0) && o !== null && o !== "" && o !== false && o !== true;
			}

			function trim(str)
			{
				if (typeof str === 'string') return $.trim(str);
				return str;
			}
			while (ii--)
			{
				p = opts_arr[ii].split(':');
				p = [p[0], p.slice(1).join(':')];

				if (/true/i.test(p[1])) p[1] = true;
				if (/false/i.test(p[1])) p[1] = false;
				if (isNumber(p[1]))
				{
					if (p[1].indexOf('.') === -1)
					{
						p[1] = parseInt(p[1], 10);
					} else
					{
						p[1] = parseFloat(p[1]);
					}
				}
				if (p.length === 2 && p[0].length > 0)
				{
					opts[trim(p[0])] = trim(p[1]);
				}
			}

			return opts;
		}
	}
	/**
	 * Plugin Pragma en JQuery.
	 * Por medio del plugin Pragma se manejarán los demás plugins de Pragma UI.
	 * @param  {string} lib                    Nombre de la librería.
	 * @param  {object|string} option/method   Matriz con las opciones por aplicar al plugin o 
	 *                                         nombre del método a ejecutar.
	 * @param  {object} params                 Parámetros por aplicar método llamado en el parámetro anterior.
	 */
	$.fn.pragma = function (lib, option, params)
	{
		return this.each(function ()
		{
			lib = lib.charAt(0).toUpperCase() + lib.slice(1);

			if (typeof (Pragma.Libs[lib]) == "function")
			{
				var $this = $(this);
				var data = $this.data('Pragma.' + lib);
				var options = $.extend({}, Pragma.Libs[lib].Defaults, Pragma.Utils.data_options($this, lib + "-options"), typeof option == 'object' && option);
				if (!data)
				{
					data = new Pragma.Libs[lib]($this, options);
					$this.data('Pragma.' + lib, data);
				}
				if (typeof option == "string")
				{
					if (typeof data[option] == "function")
					{
						data[option](params);
					}
				}
			}
		});
	}
	
	$(function ()
	{
		//Cancelar click en disabled
		$(".disabled, .disabled *").click(function (e)
		{
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
		$(".disable-click").click(function(e){
			e.preventDefault();
			return false;
		});
	});

} (window.Pragma = window.Pragma || {}, jQuery));

