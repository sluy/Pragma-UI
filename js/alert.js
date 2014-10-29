/**
 * Pragma.Libs.Alert
 * Plugin para las alertas.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-alert : define el plugin.
 * data-alert-options="[opciones]"     :   Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Alert.open()    : Muestra la alerta.
 * Alert.close()   : Cierra la alerta.
 * Alert.close()   : Si la alerta está abierto, lo cerrará, de lo contrario, lo abrirá.		
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.alert.before_init : Lanzado al inicializar el plugin.
 * pragma.alert.after_init  : Lanzado al terminar la configuración inicial del plugin.
 * pragma.alert.opening     : Lanzado inmediatamente después de llamarse al método [open()],
 * pragma.alert.open        : Lanzado al terminar el método [open()] y la alerta es visible para el usuario.
 * pragma.alert.closing     : Evento lanzado inmediatamente después de llamarse el método [close()].
 * pragma.alert.closed      : Evento lanzado cuando terminó de ejecutarse el método[close()] y la alerta es invisible 
 															para el usuario.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/alert.less
 * less/mixins/alert.less
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Alert = function (element, options)
	{
		var self = this;
		self.options = options;
		self.$el = element;
		self.opening = false;
		self.closing = false;

		/**
		 * Muestra la alerta.
		 */
		self.open = function()
		{
			if(self.opening || self.closing || self.$el.hasClass("open"))
			{
				return;
			}
			self.$el.trigger("pragma.alert.opening");
			self.opening = true;
			window.setTimeout(function(){
				self.$el.addClass("open").css("display","none");
				self.fx.run(Pragma.Utils.get_instance_option(self, "fx", "open"), "open", function ()
				{
					//Al terminar la animación:
					//Agrega la clase "open" y convierte la alerta en bloque.
					self.$el.css("display","block");

					//Si no hay botón de cerrar y debe agregarse
					if(self.$el.find(".close_button").length == 0 && self.options.add_close)
					{
						$('<a href="#" class="close_button" data-alert-dismiss>'+self.options.close_text+'</a>').click(function(e){
							e.preventDefault();
							self.close();
						}).prependTo(self.$el);
					}
					self.opening = false;
					//Dispara el evento pragma.alert.open
					self.$el.trigger("pragma.alert.open");
				});
			},self.options.open_delay);
		}
		/**
		 * Oculta la alerta. Si la opción Alert.options.destroy_on_close está activada, eliminará la alerta.
		 **/
		self.close = function()
		{
			if(self.opening || self.closing || !self.$el.hasClass("open"))
			{
				return;
			}
			self.closing = true;
			self.$el.trigger("pragma.alert.closing");
			window.setTimeout(function(){
				self.fx.run(Pragma.Utils.get_instance_option(self, "fx", "close"), "close", function ()
				{
					//Al terminar la animación:
					//Remueve la clase open y oculta el elemento.
					self.$el.css("display","none").removeClass("open");
					//Dispara el evento pragma.alert.closed 
					self.closing = false;
					self.$el.trigger("pragma.alert.closed");
					if(self.options.destroy_on_close)
					{
						self.$el.remove();
						self.$el.trigger({
							type : "pragma.alert.destroyed",
							alert : self.$el
						});
					}
				});
			},self.options.close_delay);
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
				var easing = Pragma.Utils.get_instance_option(self, "fx_easing", action)
				if (action == "open")
				{
					self.$el.finish().fadeIn(speed, easing, function () { callback(); });
				} else
				{
					self.$el.finish().fadeOut(speed, easing, function () { callback(); });
				}
			});
		}
		/**
		 * Método privado.
		 * Configura el plugin.
		 */
		function configure()
		{
			self.$el.trigger("pragma.alert.before_init");
			self.$el.removeClass("open hide").css("display","none");
			configure_fx();
			if(self.options.open_on_start)
			{
				self.open();
			}
			//Si no hay botón de cerrar y debe agregarse
			if(self.$el.find(".close_button").length == 0 && self.options.add_close)
			{
				self.$el.prepend('<a href="#" class="close_button" data-alert-dismiss>'+self.options.close_text+'</a>');
			}
			//Elementos con el atributo [data-alert-dismiss] cerrarán la alerta con click
			self.$el.find("[data-alert-dismiss]").each(function(e){
				$(this).click(function(e){
					e.preventDefault();
					self.close();
				});
			});
			self.$el.trigger("pragma.alert.after_init");
		}
		configure();
	}
	//Versión del plugin
	Pragma.Libs.Alert.Ver = "1.0.0";
	/**Opciones del plugin**/
	Pragma.Libs.Alert.Defaults = {
		add_close: true,
		close_text : "&times;",
		destroy_on_close : false,
		open_on_start : true,
		open_delay: 400, //Tiempo de espera antes de mostrar la alerta.
		close_delay: 0, //Tiempo de espera antes de cerrar la alerta.
		fx: "fade",//Efecto al abrir y cerrar la alerta [none,fade,slide]
		fx_speed: 400, //Velocidad del efecto al abrir y cerrar la alerta.
		fx_easing: false, //Efecto easing al abrir y cerrar la alerta.
		open_fx: "inherit", //Efecto al abrir la alerta [none,fade,slide,inherit]
		close_fx: "inherit", //Efecto al cerrar la alerta [none,fade,slide,inherit]
		open_fx_speed: "inherit", //Velocidad del efecto al abrir la alerta [milisegundos,inherit]
		close_fx_speed: "inherit",//Velocidad del efecto al cerrar la alerta [milisegundos,inherit]
		open_fx_easing: "inherit", //Efecto easing al abrir la alerta [nombre,inherit]
		close_fx_easing: "inherit" //Efecto easing al cerrar la alerta [nombre,inherit]
	}
	//Inicializa el plugin definido en html al cargar la página.
	$(function ()
	{
		$("[data-pragma-alert]").each(function (e)
		{
			$(this).pragma("alert");
		});
	});
} (window.Pragma = window.Pragma || {}, jQuery));
