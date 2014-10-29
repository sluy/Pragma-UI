/**
 * Pragma.Libs.Offcanvas
 * Plugin para la barra de navegación lateral dinámica.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-offcanvas : define la barra de navegación
 * data-offcanvas-[left/right]-toggle="elemento"  : El control que posea este atributo, abrirá o cerrará el menú
 *																								  alternativo lateral.
 * data-pragma-offcanvas-options="[opciones]"     : Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Offcanvas.open(left/right)    : Abre el menú especificado.
 * Offcanvas.close(left/right)   : Cierra el menú especificado.
 * Offcanvas.toggle(left/right)  : Abre o cierra el menú especificado dependiendo de su estado actual.
 * Offcanvas.open_both()         : Abre ambos menús a la vez.
 * Offcanvas.close_both()        : Cierra ambos menús a la vez.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.offcanvas.before_init          : Disparado al inicializar el plugin.
 * pragma.offcanvas.after_init           : Disparado al terminar la configuración inicial del plugin.
 * pragma.offcanvas.[left/right].opening : Evento disparado inmediatamente después de llamarse el método [open()].
 * pragma.offcanvas.[left/right].open    : Evento disparado cuando terminó de ejecutarse el método[open()] y el menú es visible
																				 : para el usuario.
 * pragma.offcanvas.[left/right].closing : Evento disparado inmediatamente después de llamarse el método [close()].
 * pragma.offcanvas.[left/right].closed  : Evento disparado cuando terminó de ejecutarse el método[close()] y el menú ya no es
																					 visible para el usuario.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/offcanvas.less
 * less/mixins/offcanvas.less
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Offcanvas = function (element, options)
	{
		var self = this;
		self.$el = element; //Elemento al cual se aplica el Offcanvas
		self.options = options; //Opciones
		/**
		* Método privado.
		* Configura variables y elementos del Offcanvas.
		*/
		function configure()
		{
			//Lanzamos el evento pragma.offcanvas.before_init
			self.$el.trigger("pragma.offcanvas.before_init");
			/**Creación de variables internas**/
			self.$wrapper = false; //Wrapper generado dinámicamente
			self.sides = {}; //Lados del offcanvas
			//Lado Izquierdo
			self.sides.left = {
				$el: false, //Almacena el menú izquierdo o false si no fue definido 
				open: false  //Almacena el estado del menú izquierdo. true abierto, false cerrado.
			};
			//Lado Derecho
			self.sides.right = {
				$el: false, //Almacena el menú derecho o false si no fue definido 
				open: false  //Almacena el estado del menú derecho. true abierto, false cerrado.
			};
			//Si consigue el menú izquierdo lo almacena en self.sides.left.$el
			if (self.$el.find(" > .offcanvas-left:first").length > 0)
			{
				self.sides.left.$el = self.$el.find(" > .offcanvas-left:first").remove();
			}
			//Si consigue el menú derecho lo almacena en self.sides.right.$el
			if (self.$el.find(" > .offcanvas-right:first").length > 0)
			{
				self.sides.right.$el = self.$el.find(" > .offcanvas-right:first").remove();
			}
			//Si no existe el menú izquierdo ni el derecho, detenemos la configuración
			if (self.sides.left.$el == false && self.sides.right.$el == false)
			{
				return;
			}
			//Definición del wrapper del Offcanvas
			self.$wrapper = $('<div class="offcanvas-wrapper"></div>');
			//Mueve el contenido al wrapper
			self.$el.contents().appendTo(self.$wrapper);
			//Añade el wrapper al Offcanvas
			self.$wrapper.appendTo(self.$el);
			//Configura el lado izquierdo si fue encontrado
			if (self.sides.left.$el)
			{
				self.sides.left.$el.prependTo(self.$wrapper);
				self.sides.left.$el.css({
					marginLeft: -(self.sides.left.$el.outerWidth())
				});
			}
			//Configura el lado derecho si fue encontrado
			if (self.sides.right.$el)
			{
				self.sides.right.$el.appendTo(self.$wrapper);
				self.sides.right.$el.css({
					marginRight: -(self.sides.right.$el.outerWidth())
				});
			}
			//Lanzamos el evento pragma.offcanvas.after_init
			self.$el.trigger("pragma.offcanvas.after_init");
		}
		/**
		* Abre el menú lateral especificado.
		*/
		self.open = function (side)
		{
			//Si no existe el lado suministrado o está abierto, detiene la ejecución del método
			if (typeof (side) != "string" && self.sides[side] === undefined || !self.sides[side].$el || self.sides[side].open)
			{
				return;
			}
			//Dispara el evento pragma.offcanvas.[left/right].opening
			self.$el.trigger("pragma.offcanvas." + side + ".opening");
			console.log("tirando pragma.offcanvas." + side + ".opening");

			//Finaliza la animación actual
			self.$wrapper.finish();
			//Crea una variable privada para almacenar las propiedades css por animar
			var animate = {};
			//Si el lado izquierdo, animamos el margen izquierdo a positivo, si es derecho, a negativo
			if (side == "left")
			{
				animate.marginLeft = parseInt(self.$wrapper.css("marginLeft")) + self.sides[side].$el.outerWidth();
			}
			else
			{
				animate.marginLeft = -(parseInt(self.$wrapper.css("marginLeft")) + self.sides[side].$el.outerWidth());
			}
			//Inicia la animación
			self.$wrapper.animate(animate, get_fx_speed("open"), get_fx_easing("open"), function ()
			{
				//Establece el menú como abierto
				self.sides[side].open = true;
				//Dispara el evento pragma.offcanvas.[left/right].open
				self.$el.trigger("pragma.offcanvas." + side + ".open");
			});
		}

		/**
		* Cierra el menú lateral especificado.
		*/
		self.close = function (side)
		{
			//Si no existe el lado suministrado o está cerrado, detiene la ejecución del método
			if (typeof (side) != "string" && self.sides[side] === undefined || !self.sides[side].$el || !self.sides[side].open)
			{
				return;
			}
			//Dispara el evento pragma.offcanvas.[left/right].closing
			self.$el.trigger("pragma.offcanvas." + side + ".closing");
			//Finaliza la animación actual
			self.$wrapper.finish();
			//Crea una variable privada para almacenar las propiedades css por animar
			var animate = {};
			//Si el lado izquierdo, animamos el margen izquierdo a negativo, si es derecho, a positivo
			if (side == "left")
			{
				animate.marginLeft = parseInt(self.$wrapper.css("marginLeft")) - self.sides[side].$el.outerWidth();
			} else
			{
				animate.marginLeft = (parseInt(self.$wrapper.css("marginLeft")) + self.sides[side].$el.outerWidth());
			}
			//Inicia la animación
			self.$wrapper.animate(
				animate,
				Pragma.Utils.get_instance_option(self, "fx_speed", "close"),
				Pragma.Utils.get_instance_option(self, "fx_easing", "close"),
				function ()
				{
					//Establece el menú como abierto
					self.sides[side].open = false;
					//Dispara el evento pragma.offcanvas.[left/right].closed
					self.$el.trigger("pragma.offcanvas." + side + ".closed");
				});
		}

		/**
		* Cierra el menú derecho e izquierdo a la vez.
		*/
		self.close_both = function ()
		{
			self.close("left");
			self.close("right");
		}

		/**
		* Abre el menú lateral especificado.
		*/
		self.open = function (side)
		{
			
			//Si no existe el lado suministrado o está abierto, detiene la ejecución del método
			if (typeof (side) != "string" && self.sides[side] === undefined || !self.sides[side].$el || self.sides[side].open)
			{
				return;
			}
			//Dispara el evento pragma.offcanvas.[left/right].opening
			self.$el.trigger("pragma.offcanvas." + side + ".opening");
			//Crea una variable privada para almacenar las propiedades css por animar
			var animate = {};
			//Si el lado izquierdo, animamos el margen izquierdo a positivo, si es derecho, a negativo
			if (side == "left")
			{
				animate.marginLeft = parseInt(self.$wrapper.css("marginLeft")) + self.sides[side].$el.outerWidth();
			}
			else
			{
				animate.marginLeft = -(parseInt(self.$wrapper.css("marginLeft")) + self.sides[side].$el.outerWidth());
			}
			//Cierra el menú que esté abierto.
			self.close_both();
			//Espera a la finalización de animaciones en el wrapper
			//Especial para cuando existía un menú abierto y debe esperar a que se cierre
			self.$wrapper.promise().done(function ()
			{
				//Comienza la animación de apertura.
				self.$wrapper.animate(
					animate,
					Pragma.Utils.get_instance_option(self, "fx_speed", "open"),
					Pragma.Utils.get_instance_option(self, "fx_easing", "open"),
					function ()
					{
						//Establece el menú como abierto
						self.sides[side].open = true;
						//Dispara el evento pragma.offcanvas.[left/right].open
						self.$el.trigger("pragma.offcanvas." + side + ".open");
					});
			})
		}

		/**
		* Abre o cierra el menú lateral especificado dependiendo de su estado actual.
		*/
		self.toggle = function (side)
		{
			//Si no existe el lado suministrado detiene la ejecución del método
			if (typeof (side) != "string" && self.sides[side] === undefined || !self.sides[side].$el)
			{
				return;
			}
			

			//Si el menú está abierto lo cerrará, de lo contrario, lo abrirá
			if (self.sides[side].open)
			{
				self.close(side);
			} else
			{
				self.open(side);
			}
		}


		//Inicia la configuración al iniciar el plugin.
		configure();
	}

  //Versión del plugin
  Pragma.Libs.Offcanvas.Ver = "1.0.0";
	//Opciones
	Pragma.Libs.Offcanvas.Defaults = {
		fx: true,               //Determina si los menús tendrán la animación 'deslizada' o no.
		fx_speed: 300,          //Velocidad en milisegundos de la animación al abrir o cerrar un menú.
		open_fx_speed: "inherit",       //Velocidad en milisegundos de la animación al abrir un menú.
		close_fx_speed: "inherit",      //Velocidad en milisegundos de la animación al cerrar un menú.
		fx_easing: false,       //Efecto easing usado en las animaciones de los menús.
		open_fx_easing: "inherit",  //Efecto easing usado en la animación al abrir un menú.
		close_fx_easing: "inherit"  //Efecto easing usado en la animación al cerrar un menú.
	}


	//Agrega los eventos al hacer click en los controles para abrir/cerrar los menús del Offcanvas
	$(document).on('click.pragma.offcanvas.toggle', '[data-offcanvas-left-toggle],[data-offcanvas-right-toggle]', function (e)
	{
		e.preventDefault();
		e.stopPropagation();

		var side = $(this).attr("data-offcanvas-left-toggle") !== undefined ? "left" : "right";

		var $target = Pragma.Utils.get_target($(this), "offcanvas-" + side + "-toggle", false, ".offcanvas");
		if ($target)
		{
			$target.pragma("offcanvas", "toggle", side);
		}
	});



} (window.Pragma = window.Pragma || {}, jQuery));
