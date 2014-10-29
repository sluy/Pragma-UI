/**
 * Pragma.Libs.ScrollTop
 * Plugin para el botón "scrollTop"
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * Html:
 * #---------------
 * data-pragma-scrolltop : define el plugin.
 * data-scrolltop-options="[opciones]"     :   Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * ScrollTop.move()    : Mueve el scroll desde su posición actual hasta la inicial.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.scrolltop.before_init : Lanzado al inicializar el plugin.
 * pragma.scrolltop.after_init  : Lanzado al terminar la configuración inicial del plugin.
 * pragma.scrolltop.start     : Lanzado inmediatamente después de llamarse al método [move()],
 * pragma.scrolltop.end        : Lanzado al terminar el método [move()] y el scroll se movió hasta su posición inicial.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/scrolltop.less
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.ScrollTop = function (element, options)
	{
		var self = this;
		self.options = options; //Opciones
		self.$el = $(element).addClass("scroll-top");
		/**
		 * Mueve el scroll desde su posición actual hasta la inicial.
		 */
		self.move = function()
		{
			self.$el.trigger("pragma.scrolltop.start");
			if (self.options.fx)
			{
				$("html, body").animate({ scrollTop: 0 }, self.options.fx_speed,self.options.fx_easing,function(){
					self.$el.trigger("pragma.scrolltop.end");
				});
			} else
			{
				$("html, body").scrollTop(0);
				self.$el.trigger("pragma.scrolltop.end");
			}
		}

		/**
		 * Método privado.
		 * Configura el plugin.
		 */
		function configure()
		{
			self.$el.trigger("pragma.scrolltop.before_init");
			//Click al botón
			self.$el.click(function (e)
			{
				e.preventDefault();
				self.move();
			});
			//Mostrar/ocultar al mover el scroll
			$(window).scroll(function (e)
			{
				if ($(this).scrollTop() > 0)
				{
					self.$el.addClass("show");
				} else
				{
					self.$el.removeClass("show");
				}
			});

			if($(this).scrollTop() > 0)
			{
				self.$el.addClass("show");
			}
			else
			{
				self.$el.removeClass("show");
			}
			self.$el.trigger("pragma.scrolltop.after_init");
		}
		//inicia la configuración
		configure();
	}
	//Versión del plugin
	Pragma.Libs.ScrollTop.Ver = "1.0.0";

	/**Opciones del plugin**/
	Pragma.Libs.ScrollTop.Defaults = {
		fx: true,
		fx_speed: 300,
		fx_easing : false
	}
	
	//Inicializa el plugin definido en html al cargar la página.
	$(function ()
	{
		$("[data-pragma-scrolltop]").each(function (e)
		{
			$(this).pragma("ScrollTop");
		});
	});
} (window.Pragma = window.Pragma || {}, jQuery));