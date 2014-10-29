/**
 * Pragma.Libs.Tooltip
 * Plugin para los tooltips.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-tooltip : define el plugin.
 * data-tooltip-options="[opciones]"     :   Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Tooltip.open()    : Muestra el tooltip.
 * Tooltip.close()   : Cierra el tooltip.
 * Tooltip.toggle()   : Si el tooltip está abierto, lo cerrará, de lo contrario, lo abrirá.		
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.tooltip.before_init : Lanzado al inicializar el plugin.
 * pragma.tooltip.after_init  : Lanzado al terminar la configuración inicial del plugin.
 * pragma.tooltip.opening     : Lanzado inmediatamente después de llamarse al método [open()],
 * pragma.tooltip.open        : Lanzado al terminar el método [open()] y el tooltip es visible para el usuario.
 * pragma.tooltip.closing     : Evento lanzado inmediatamente después de llamarse el método [close()].
 * pragma.tooltip.closed      : Evento lanzado cuando terminó de ejecutarse el método[close()] y el tooltip es invisible 
 															para el usuario.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/tooltip.less
 * less/mixins/tooltip.less
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Tooltip = function (element, options)
	{
		var self = this;
		self.$el = $(element);
		self.options = options;
		self.$tooltip = $('<div class="tooltip"></div>');

		/**
		 * Muestra el tooltip.
		 * @param  {bool} animate determina si deberá animarse o no la aparición del tooltip.
		 */
		self.open = function (animate)
		{
			if (self.$tooltip.hasClass("open"))
			{
				return;
			}
			self.$el.trigger({
				type: "pragma.tooltip.opening",
				tooltip: self.$tooltip
			});
			self.$tooltip.appendTo(document.body)
									 .removeClass("top left right bottom")
									 .removeClass("inverse primary secondary success tip warning danger")
									 .addClass(self.options.style.toString())
									 .html(get_title());
			var pos = get_position();

			self.$tooltip.css("display", "block").offset(
			{
				top: pos.top,
				left: pos.left
			}).addClass(pos.class).css("display", "none").addClass("open");

			if (animate != false)
			{
				animate = true;
			}
			if (animate)
			{
				self.fx.run(Pragma.Utils.get_instance_option(self, "fx", "open"), "open", function ()
				{
					//Al terminar la animación:
					//Agrega la clase "open" y convierte el menú desplegable en bloque.
					self.$tooltip.css({ "display": "block" });
					//Dispara el evento pragma.dropdown.open pasando como parámetro 'trigger' el elemento
					//que activó el menú desplegable.
					self.$el.trigger({
						type: "pragma.tooltip.open",
						tooltip: self.$tooltip
					});
				});
			} else
			{
				self.$tooltip.addClass("open").css("display", "block");
				self.$el.trigger({
					type: "pragma.tooltip.open",
					tooltip: self.$tooltip
				});
			}

		}

		/**
		 * Oculta el tooltip.
		 * @param  {bool} animate determina si deberá animarse o no la aparición del tooltip.
		 */
		self.close = function (animate)
		{
			if (!self.$tooltip.hasClass("open"))
			{
				return;
			}
			self.$el.trigger({
				type: "pragma.tooltip.closing",
				tooltip: self.$tooltip
			});
			if (animate != false)
			{
				animate = true;
			}
			if (animate)
			{
				self.fx.run(Pragma.Utils.get_instance_option(self, "fx", "close"), "close", function ()
				{
					self.$tooltip.detach().removeClass("open").css({ "display": "none" });
					self.$el.trigger({
						type: "pragma.tooltip.closed",
						tooltip: self.$tooltip
					});
				});
			} else
			{
				self.$tooltip.detach().removeClass("open").css({ "display": "none" });
				self.$el.trigger({
					type: "pragma.tooltip.closed",
					tooltip: self.$tooltip
				});
			}
		}
		/**
		 * Alterna el estado del tooltip, entre abierto o cerrado, dependiendo de su estado actual.
		 * Si el estado actual es cerrado, lo abrirá y viceversa.
		 */
		self.toggle = function ()
		{
			if (self.$tooltip.hasClass("open"))
			{
				self.close();
			} else
			{
				self.open();
			}
		}
	
		/**
		 * Método privado.
		 * Busca recursivamente el título del tooltip.
		 * @return {string}
		 */
		function get_title()
		{
			var title = self.options.title.toString();
			if (title.length == 0)
			{
				self.options.title = self.$el.attr("title");
				title = self.options.title;
				//Eliminamos el atributo "title" para evitar la renderización por defecto
				self.$el.attr("title", "");
			}
			if (!self.options.html)
			{
				title = $("<div>" + title + "</div>").text();
			}
			return title;
		}
		/**
		 * Método privado.
		 * Devuelve la posición donde deberá mostrarse el plugin.
		 * En principio verificará que la posición por defecto establecida en la opción
		 * Tooltip.options.position es visible, sino, buscará automáticamente donde 
		 * sea visible.
		 * @return {object}
		 */
		function get_position()
		{
			self.$tooltip.css({ display: "block", visibility: "hidden" });

			var get = function (pos, force)
			{
				if (pos == "top" && (force || self.$el.offset().top - self.$tooltip.outerHeight() > $(window).scrollTop()))
				{
					return {
						top: self.$el.offset().top - self.$tooltip.outerHeight() - 8,
						left: ((self.$el.offset().left + (self.$el.outerWidth() * 0.5)) - self.$tooltip.outerWidth() * 0.5),
						class: "top"
					};
				}
				if (pos == "bottom" &&
					 (force || self.$el.offset().top + self.$el.outerHeight() + self.$tooltip.outerHeight() <= $(window).scrollTop() + $(window).height()))
				{
					return {
						top: self.$el.offset().top + self.$el.outerHeight() + 8,
						left: ((self.$el.offset().left + (self.$el.outerWidth() * 0.5)) - self.$tooltip.outerWidth() * 0.5),
						class: "bottom"
					};
				}


				if (pos == "left" &&
					 (force || self.$el.offset().left - self.$tooltip.outerWidth() >= 0))
				{
					return {
						top: self.$el.offset().top + (self.$el.outerHeight() * 0.5) - (self.$tooltip.outerHeight() * 0.5),
						left: (self.$el.offset().left - self.$tooltip.outerWidth()) - 8,
						class: "left"
					};
				}
				if (pos == "right" &&
					 (force || self.$el.offset().left + self.$el.outerWidth() + self.$tooltip.outerHeight() <= $(window).width()))
				{
					return {
						top: self.$el.offset().top + (self.$el.outerHeight() * 0.5) - (self.$tooltip.outerHeight() * 0.5),
						left: self.$el.offset().left + self.$el.outerWidth() + 8,
						class: "right"
					};
				}
				return false;
			}

			var position = self.options.position.toString().toLowerCase();
			if (position != "top" && position != "left" && position != "bottom" && position != "right")
			{
				position = top;
			}
			var order =
			{
				top: ['top', 'bottom', 'left', 'right'],
				bottom: ['bottom', 'top', 'left', 'right'],
				left: ['left', 'right', 'top', 'bottom'],
				right: ['right', 'left', 'top', 'bottom']
			}

			var result = false;

			for (var n = 0; n <= order[position].length; n++)
			{
				result = get(order[position][n]);
				if (result)
				{
					break;
				}
			}

			if (!result)
			{
				result = get(position, true);
			}
			self.$tooltip.css({ display: 'none', visibility: "visible" });
			return result;
		}

		/**
		 * Método privado.
		 * Configura los efectos del plugin.
		 */
		function configure_fx()
		{
			self.fx = new Pragma.Utils.fx_manager();
			//Agrega el efecto "fade"
			self.fx.add("fade", function (action, callback)
			{
				var speed = Pragma.Utils.get_instance_option(self, "fx_speed", action);
				var easing = Pragma.Utils.get_instance_option(self, "fx_easing", action);
				if (action == "open")
				{
					self.$tooltip.stop().fadeIn(speed, easing, function () { callback(); });
				} else
				{
					self.$tooltip.stop().fadeOut(speed, easing, function () { callback(); });
				}
			});

			self.fx.add("slide", function (action, callback)
			{
				var speed = Pragma.Utils.get_instance_option(self, "fx_speed", action);
				var easing = Pragma.Utils.get_instance_option(self, "fx_easing", action);

				if (action == "open")
				{

					self.$tooltip.css({ display: "block", opacity: 0 })
					if (self.$tooltip.hasClass("top"))
					{
						self.$tooltip.css({ marginTop: -30 }).stop()
												 .animate({ marginTop: 0, opacity: 1 }, speed, easing, function () { callback(); });
					}
					if (self.$tooltip.hasClass("bottom"))
					{
						self.$tooltip.css({ marginTop: 30 }).stop()
												 .animate({ marginTop: 0, opacity: 1 }, speed, easing, function () { callback(); });
					}
					if (self.$tooltip.hasClass("left"))
					{
						self.$tooltip.css({ marginLeft: -30 }).stop()
												 .animate({ marginLeft: 0, opacity: 1 }, speed, easing, function () { callback(); });
					}
					if (self.$tooltip.hasClass("right"))
					{
						self.$tooltip.css({ marginLeft: 30 }).stop()
												 .animate({ marginLeft: 0, opacity: 1 }, speed, easing, function () { callback(); });
					}
				} else if (action == "close")
				{

					self.$tooltip.css({ display: "block", opacity: 1 })
					if (self.$tooltip.hasClass("top"))
					{
						self.$tooltip.css({ marginTop: 0 }).stop()
												 .animate({ marginTop: -30, opacity: 0 }, speed, easing, function ()
												 {
												 	self.$tooltip.css({ marginTop: 0, opacity: 1 });
												 	callback();
												 });
					}
					if (self.$tooltip.hasClass("bottom"))
					{
						self.$tooltip.css({ marginTop: 0 }).stop()
												 .animate({ marginTop: 30, opacity: 0 }, speed, easing, function ()
												 {
												 	self.$tooltip.css({ marginTop: 0, opacity: 1 });
												 	callback();
												 });
					}
					if (self.$tooltip.hasClass("left"))
					{
						self.$tooltip.css({ marginLeft: 0 }).stop()
												 .animate({ marginLeft: -30, opacity: 0 }, speed, easing, function ()
												 {
												 	self.$tooltip.css({ marginLeft: 0, opacity: 1 });
												 	callback();
												 });
					}
					if (self.$tooltip.hasClass("right"))
					{
						self.$tooltip.css({ marginLeft: 0 }).stop()
												 .animate({ marginLeft: 30, opacity: 0 }, speed, easing, function ()
												 {
												 	self.$tooltip.css({ marginLeft: 0, opacity: 1 });
												 	callback();
												 });
					}
				}


			});
		}
		/**
		 * Configura el plugin.
		 */
		function configure()
		{
			self.$el.trigger("pragma.tooltip.before_init");
			//Añade el tooltip
			self.$tooltip = $('<div class="tooltip">' + get_title() + '</div>');
			//Configura el trigger
			self.options.trigger = self.options.trigger.toString().toLowerCase();
			configure_fx();
			switch (self.options.trigger)
			{
				case "focus":
					self.$el
					.on("focus.pragma.tooltip.open", function (e)
					{
						e.preventDefault();
						self.open();
					})
					.on("focusout.pragma.tooltip.close", function (e)
					{
						self.close();
					});
					break;
				case "click":
					self.$el.on("click.pragma.tooltip.toggle", function (e)
					{
						self.toggle();
					});
					break;
				case "hover":
					self.$el
					.on("mouseenter.pragma.tooltip.open", function (e)
					{
						self.open();
					}).on("mouseleave.pragma.tooltip.close", function (e)
					{
						self.close();
					});
					break;
			}
			self.$el.trigger("pragma.tooltip.after_init");
		}

		//Inicializa la configuración del plugin.
		configure();
	}


  //Versión del plugin
  Pragma.Libs.Tooltip.Ver = "1.0.0";
	/**Opciones del plugin**/
	Pragma.Libs.Tooltip.Defaults = {
		trigger: "hover", //evento que activa el tooltip [hover,click,both,manual]
		title: "", //Mensaje por defecto del tooltip.
		html: false, //Determina si se podrá usar html en el mensaje del tooltip
		position: "top", //Posición por defecto del tooltip.
		style: "", //Estilo visual  [inverse,primary,secondary,success,tip,warning,danger]
		open_delay: 0, //Tiempo de espera antes de mostrar el tooltip.
		close_delay: 0, //Tiempo de espera antes de cerrar el tooltp.
		fx: "fade",//Efecto al abrir y cerrar el tooltip [none,fade,slide]
		fx_speed: 300, //Velocidad del efecto al abrir y cerrar el tooltip.
		fx_easing: false, //Efecto easing al abrir y cerrar el tooltip.
		open_fx: "inherit", //Efecto al abrir el tooltip [none,fade,slide,inherit]
		close_fx: "inherit", //Efecto al cerrar el tooltip [none,fade,slide,inherit]
		open_fx_speed: "inherit", //Velocidad del efecto al abrir el tooltip [milisegundos,inherit]
		close_fx_speed: "inherit",//Velocidad del efecto al cerrar el tooltip [milisegundos,inherit]
		open_fx_easing: "inherit", //Efecto easing al abrir el tooltip [nombre,inherit]
		close_fx_easing: "inherit" //Efecto easing al cerrar el tooltip [nombre,inherit]
	}

	//Inicializa el plugin definido en html al cargar la página.
	$(function ()
	{
		$("[data-pragma-tooltip]").each(function (e)
		{
			$(this).pragma("tooltip");
		});
	});
} (window.Pragma = window.Pragma || {}, jQuery));