/**
 * Pragma.Libs.Sticky
 * Plugin para convertir elementos en adhesivos.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * Html:
 * #---------------
 * data-pragma-sticky : define el plugin.
 * data-scrolltop-sticky="[opciones]"     :   Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Sticky.move()    : Aplica estilos necesarios para que el elemento siempre esté visible.
 * Sticky.restore()    : Devuelve los estilos del elemento a sus valores iniciales.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.sticky.before_init : Lanzado al inicializar el plugin.
 * pragma.sticky.after_init  : Lanzado al terminar la configuración inicial del plugin.
 * pragma.sticky.moving      : Lanzado inmediatamente después de llamarse al método [move()].
 * pragma.sticky.moved       : Lanzado al terminar el método [move()] y se aplicaron los estilos necesarios 
 *                                al elemento para que siempre esté visible.
 * pragma.sticky.restoring   : Lanzado inmediatamente después de llamarse al método [restore()].
 * pragma.sticky.restored    : Lanzado al terminar el método [restore()] y se devolvieron los estilos del elemento
 *                                a sus valores iniciales.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/sticky.less
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Sticky = function (element, options)
	{
		var self = this;
		self.$el = element; //Elemento al cual se aplica el Offcanvas
		self.options = options; //Opciones
		/**
		 * Mueve el elemento convirtiéndolo en "sticky".
		 * @param  {bool} animate Determina si deberá animarse o no al convertir en sticky.
		 */
		self.move = function (animate)
		{
			if (self.$el.hasClass("sticky") || !self.$el.is(":visible"))
			{
				return;
			}
			self.$el.trigger("pragma.sticky.moving");
			store_properties();
			self.$el.addClass("sticky").appendTo($("body"));

			if (self.options.footer)
			{
				self.$el.css("bottom", (0 + self.options.offset));
			} else
			{
				self.$el.css("top", (0 + self.options.offset));
			}

			if (self.options.expand)
			{
				self.$el.css("width", "100%");
			} else
			{
				self.$el.css("width", self.properties.real.width);
				self.$el.css("left", self.properties.real.left);
			}
			self.$clone.css("display", self.properties.css.display);
			self.$el.trigger("pragma.sticky.moved");
		}
		/**
		 * Devuelve el elemento a su posición original.
		 * @param  {bool} animate Determina si deberá animarse o no al devolver la posición inicial.
		 */
		self.restore = function (animate)
		{
			if (!self.$el.hasClass("sticky"))
			{
				return;
			}
			self.$el.trigger("pragma.sticky.restoring");
			self.$clone.css("display", "none");
			//Elimina la clase "sticky"
			self.$el.removeClass("sticky");
			//Devuelve el 'display' original
			self.$el.css(self.properties.css);
			//Devuelve el elemento a su posición original
			self.$el.insertAfter(self.$clone);
			//Disparamos el evento pragma.sticky.restored
			self.$el.trigger("pragma.sticky.restored");
		}
		/**
		 * Método privado. 
		 * Almacena las posiciones originales del control
		 */
		function store_properties()
		{
			if (self.properties == undefined)
			{
				self.properties =
				{
					css:
					{
						display: self.$el.css("display"),
						top: self.$el.css("top"),
						left: self.$el.css("left"),
						bottom: self.$el.css("bottom"),
						width: self.$el[0].style.width,
						height: self.$el[0].style.height
					},
					real:
					{
						width: self.$el.width(),
						height: self.$el.height(),
						top: self.$el.offset().top,
						left: self.$el.offset().left
					}
				}
			} else
			{
				self.$clone.css("display", self.properties.css.display);

				self.properties.real.width = self.$clone.width();
				self.properties.real.height = self.$clone.height();
				self.properties.real.top = self.$clone.offset().top;
				self.properties.real.left = self.$el.offset().left;

				self.$clone.css("display", "none");
			}
		}
		/**
		 * Método privado.
		 * Configura el plugin.
		 */
		function configure()
		{
			//Clona el elemento original antes de el mismo, para conservar el espacio 
			self.$clone = self.$el.clone(false, false).insertAfter(self.$el).css({ visibility: "hidden", display: "none" });
			store_properties();

			$(document).on("scroll.pragma.sticky", function (e)
			{
				if (self.properties.real.top < $(this).scrollTop())
				{
					self.move();
				} else
				{
					self.restore();
				}
			});
			$(window).on("resize.pragma.sticky", function (e)
			{
				if (self.$el.hasClass("sticky"))
				{
					self.restore(false);
					self.move(false);
				}
			});
		}
		//Inicializa la configuración del plugin.
		configure();
	}
	//Versión del plugin
	Pragma.Libs.Sticky.Ver = "1.0.0";
	//Opciones de configuración
	Pragma.Libs.Sticky.Defaults = {
		expand: false, //Determina si el elemento se expandirá al 100% del ancho de la página.
		footer: false, //Determina si el elemento se mostrará en la esquina inferior de la página.
		offset: 0, //Determina el espacio entre el elemento adhesivo y el margen superior o inferior de la página.
		fx: "none", //Efecto del Sticky al moverse y volver a su posición original. [false,fade,slide]
		move_fx: "inherit", //Determina el efecto que tendrá el sticky al moverse.
		restore_fx: "inherit", //Determina el efecto que tendrá el sticky al volver a su posición original.
		fx_speed: 400, //Velocidad en milisegundos del efecto
		move_fx_speed: "inherit", //Velocidad en milisegundos del efecto al convertir el elemento en sticky.
		restore_fx_speed: "inherit", //Velocidaden milisegundos del efecto al devolver el elemento a su posición original.
		fx_easing: false, //Efecto easing asociado a la animación
		move_fx_easing: "inherit", //Efecto easing al convertir el elemento en sticky
		restore_fx_easing: "inherit", //Efecto easing al devolver el elemento a su posición original.
		wait: 0 // Tiempo en milisegundos que tardará antes de hacer visible el Sticky
	}
	//Inicializa el plugin definido en html al cargar la página.
	$(function ()
	{
		$("[data-pragma-sticky]").each(function ()
		{
			$(this).pragma("sticky");
		});
	});
} (window.Pragma = window.Pragma || {}, jQuery));