/**
 * Pragma.Libs.Scrollspy
 * Plugin para escuchar el scroll en contenidos.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-scrollspy="#id_del_menú" : define el scrollspy y el menú asociado.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.dropdown.before_init : lanzado al inicializar el plugin.
 * pragma.dropdown.after_init  : lanzado al terminar la configuración inicial del plugin.
 * 
 * pragma.scrollspy.change     :Evento lanzado al cambiar el elemento activo. 
																Suministra la variable event.active con el id del elemento activo.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Scrollspy = function (element, options)
	{
		var self = this;
		self.options = options;
		self.$el = $(element);

		/**
		* Método privado.
		* Añade animaciones al hacer click a un elemento de la navegación.
		*/
		function attach_animation()
		{
			if (self.options.fx)
			{
				//Fix IE FIREFOX
				var $listener = self.$el.is("body")?$("html,body"):self.$el;

				self.$nav.find('a[href^="#"]:not(.disabled)').each(function ()
				{
					$(this).click(function (e)
					{
						var href = $(this).attr('href');
						if (href.length > 1 && self.$el.find(href).length > 0)
						{
							e.preventDefault();

							$listener.animate({
								'scrollTop': $(href).offset().top - self.options.offset
							}, parseInt(self.options.fx_speed), function ()
							{
								//Prevenimos el salto de página al cambiar el anchor
								var pos = $(window).scrollTop();
								window.location.hash = href;
								$(window).scrollTop(pos);

							});
						}
					});
				});
			}
		}

		/**
		* Método privado.
		* Establece un ítem de la navegación como activo.
		*/
		function setActive(href)
		{
			if (self.$nav.length == 0)
				return false;
			var $nav = self.$nav.find('a[href="' + href + '"]');

			self.$nav.find('a[href^="#"]:not(.disabled)').each(function ()
			{
				if ($(this).attr('href').length > 1 && self.$el.find($(this).attr('href')).length > 0)
				{
					$(this).parent().removeClass("active");
					if ($(this).parent().parent().parent().is("li"))
					{
						$(this).parent().parent().parent().removeClass("active");
					}
				}
			});
			$nav.parent().addClass("active");
			if ($nav.parent().parent().parent().is("li"))
			{
				$nav.parent().parent().parent().addClass("active");
			}
		}

		/**
		* Método privado.
		* Escucha el scroll de la página y establece el elemento activo.
		*/
		function listen()
		{
			var scroll = self.$scroll.scrollTop();
			self.$nav.find('a[href^="#"]:not(.disabled)').each(function ()
			{
				var href = $(this).attr('href');
				var nav = $(this);


				if (href.length > 1 && $(href).length > 0)
				{
					//offset agregado
					if ($(href).position().top <= parseInt(self.options.offset) + self.$scroll.scrollTop())
					{
						setActive(href);
						self.$el.trigger({
							type: "pragma.scrollspy.change",
							active: href
						});
					}
				}
			});
		}
		/**
		* Método privado.
		* Inicia la configuración del plugin.
		*/
		function configure()
		{
			//Al encontrar que no existe menú asociado al scrollspy, detiene la configuración del plugin
			if (self.options.target.length == 0 || $(self.options.target).length == 0)
			{
				return;
			}
			self.$scroll = self.$el.is('body') ? $(window) : self.$el;
			self.$el.trigger("pragma.scrollspy.before_init");
			self.$nav = $(self.options.target);
			self.$el.css("position", "relative");
			if (self.options.fx)
			{
				attach_animation();
			}
			self.$scroll.scroll(function (event) { listen(); });
			listen();
			self.$el.trigger("pragma.scrollspy.after_init");
		}
		configure();
	}

  //Versión del plugin
  Pragma.Libs.Scrollspy.Ver = "1.0.0";
  //Opciones de configuración
	Pragma.Libs.Scrollspy.Defaults = {
		target: "", //Id de la navegación
		offset: 15, //Offset
		fx: true, //Activa o desactiva la animación al hacer click a un elemento de la navegación
		fx_speed: 200//Milisegundos de la animación
	}


	$(function ()
	{
		//Recorre los elementos con el atributo data-pragma-scroollspy al cargar la página
		$("[data-pragma-scrollspy]").each(function (e)
		{
			//Busca la navegación asociada al scrollspy
			var $target = Pragma.Utils.get_target($(this), "pragma-scrollspy");
			//Si se definió la navegación asociada al scrollspy, inicializamos el plugin
			if ($target)
			{
				$(this).pragma("scrollspy", { target: $(this).attr("data-pragma-scrollspy") });
			}
		});
	});
} (window.Pragma = window.Pragma || {}, jQuery));